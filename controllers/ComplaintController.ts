import { Request, Response } from 'express';
import ComplaintModel, { ComplaintStatus, ComplaintType } from '../models/Complaint';
import PostModel, { PostStatus } from '../models/Post';
import UserModel, { UserStatus } from '../models/User';
import ComplaintDTO, { ComplaintDetailDTO, UserComplaintDTO } from '../dtos/ComplaintDTO';
import { broadCastMessage, implementComplaintIdIF, MessageEvents } from '../controllers/SocketController';
import Complaint from '../models/Complaint';
import { ComplaintMessageDTO } from '../dtos/MessageDTO';
import WSError from '../errors/WSError';
import Message from '../models/Message';
import UserDTO from '../dtos/UserDTO';
import RoleDTO from '../dtos/RoleDTO';

export interface IComplaintMessageCreate {
  text: string;
  complaintId: string;
  user: UserDTO;
  event: MessageEvents;
}

class ComplaintController {
  async getComplaints(req: Request, res: Response) {
    try {
      const {
        status,
        user,
        type,
        sort = 'createdAt',
        sortValue = 'desc',
      } = req.query;

      const { user: currentUser } = req as any;

      const sortValueParsed = sortValue === 'desc' ? 'desc' : 'asc';

      const complaints = await ComplaintModel.find({
        ...(type ? { type } : {}),
        ...(user ? { user } : {}),
        ...(status ? { status } : {}),
      }).populate([
        {
          path: 'author'
        },
        {
          path: 'userId'
        },
        {
          path: 'postId'
        },
        {
          path: 'whoResolve'
        },
        {
          path: 'messages',
          populate: {
            path: 'user'
          }
        }
      ]).sort({ [String(sort)]: sortValueParsed }).exec();

      return res.json(complaints.map(it => new ComplaintDTO({
        ...it.toObject(),
        unreadableMessages: it.messages.filter((it: any) => {
          return !it.read && it.user._id.toString() !== currentUser.id
        }).length,
      })));
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  async getComplaint(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { user } = req as any;

      const complaint = await ComplaintModel.findOne({
        _id: id
      }).populate([
        {
          path: 'author'
        },
        {
          path: 'userId'
        },
        {
          path: 'postId'
        },
        {
          path: 'whoResolve'
        },
        {
          path: 'messages',
          populate: {
            path: 'user'
          }
        }
      ]).exec();

      if (!complaint) {
        return res.status(400).json({ message: 'Жалоба не найдена' });
      }

      if (complaint.author._id.toString() !== user.id && !(user as any).roles.find((role: RoleDTO) => {
        return ['ADMIN', 'MODERATOR'].includes(role.value);
      })) {
        return res.status(400).json({ message: 'Жалоба не найдена' });
      }

      await Promise.all(complaint.messages.filter((it: any) => !it.read && it.user._id.toString() !== user.id).map(async (it: any) => {
        it.read = true;
        await it.save();
      }))

      return res.json(new ComplaintDetailDTO(complaint));
    } catch (e) {
      console.log(e)
      return res.status(500).json({ message: 'Server error' });
    }
  }

  async resolveComplaint(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { user } = req as any;

      const complaint = await ComplaintModel.findById(id);

      if (!complaint) {
        return res.status(400).json({ message: 'Жалоба не найдена' })
      }

      if ([ComplaintStatus.RESOLVED, ComplaintStatus.CLOSED].includes(complaint.status as ComplaintStatus)) {
        return res.status(400).json({message: 'Жалоба уже закрыта или решена'});
      }

      complaint.status = ComplaintStatus.RESOLVED;
      complaint.whoResolve = user.id;

      await complaint.save();

      broadCastMessage(complaint.author.toString(), { event: MessageEvents.RESOLVE_COMPLAIN, complaintId: id, status: ComplaintStatus.RESOLVED })

      return res.json({ message: 'Жалоба успешно решена' });
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  async closeComplaint(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { user } = req as any;

      const complaint = await ComplaintModel.findById(id);

      if (!complaint) {
        return res.status(400).json({ message: 'Жалоба не найдена' })
      }

      if ([ComplaintStatus.RESOLVED, ComplaintStatus.CLOSED].includes(complaint.status as ComplaintStatus)) {
        return res.status(400).json({message: 'Жалоба уже закрыта или решена'});
      }

      complaint.status = ComplaintStatus.CLOSED;
      complaint.whoResolve = user.id;

      await complaint.save();

      broadCastMessage(complaint.author.toString(), { event: MessageEvents.CLOSE_COMPLAIN, complaintId: id, status: ComplaintStatus.CLOSED })

      return res.json({ message: 'Жалоба успешно закрыта' });
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  async unresolveComplaint(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const complaint = await ComplaintModel.findById(id);

      if (!complaint) {
        return res.status(400).json({ message: 'Жалоба не найдена' })
      }

      complaint.status = ComplaintStatus.UNRESOLVED;
      complaint.whoResolve = undefined;

      await complaint.save();

      return res.json({ message: 'Жалоба успешно открыта' });
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  async createMessage(message: IComplaintMessageCreate): Promise<ComplaintMessageDTO> {
    const { text, user, event, complaintId } = message;

    const complaint = await ComplaintModel.findById(complaintId);

    if (!complaint) {
      throw WSError.badRequest('Жалоба не найдена');
    }

    if (complaint.author.toString() !== user.id && !(user as any).roles.find((role: RoleDTO) => {
      return ['ADMIN', 'MODERATOR'].includes(role.value);
    })) {
      throw WSError.badRequest('Жалоба не найдена');
    }

    const dbMessage = await Message.create({ text, user: user.id, event, read: false });

    complaint.messages = [...(complaint.messages || []), dbMessage._id];
    await complaint.save();

    return new ComplaintMessageDTO({ ...dbMessage.toObject(), complaintId: complaint._id.toString(), user });
  }

  async getMyComplaints(req: Request, res: Response) {
    try {
      const {
        status,
        type,
        sort = 'createdAt',
        sortValue = 'desc',
      } = req.query;

      const sortValueParsed = sortValue === 'desc' ? 'desc' : 'asc';

      const { user } = req as any;

      const complaints = await ComplaintModel.find({
        author: user.id,
        ...(type ? { type } : {}),
        ...(status ? { status } : {}),
      }).populate([
        {
          path: 'author'
        },
        {
          path: 'userId'
        },
        {
          path: 'postId'
        },
        {
          path: 'whoResolve'
        },
        {
          path: 'messages',
          populate: {
            path: 'user'
          }
        }
      ]).sort({ [String(sort)]: sortValueParsed }).exec();

      return res.json(complaints.map(it => new UserComplaintDTO({
        ...it.toObject(),
        unreadableMessages: it.messages.filter((it: any) => {
          return !it.read && it.user._id.toString() !== user.id
        }).length,
      })));
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  async createPostComplaint(req: Request, res: Response) {
    try {
      const { text, postId } = req.body;
      const { user } = req as any;

      const post = await PostModel.findOne({ _id: postId, status: PostStatus.ACTIVE });

      if (!post) {
        return res.status(400).json({ message: 'Пост не найден или уже заблокирован' })
      }

      const complaint = new Complaint({ text, author: user.id, postId, type: ComplaintType.POST, status: ComplaintStatus.UNRESOLVED });
      await complaint.save();

      await implementComplaintIdIF(complaint._id.toString());

      return res.json(new UserComplaintDTO({ ...complaint.toObject(), postId: post, author: user }));
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  async createUserComplaint(req: Request, res: Response) {
    try {
      const { text, userId } = req.body;
      const { user } = req as any;

      const candidate = await UserModel.findOne({ _id: userId, status: UserStatus.ACTIVE });

      if (!candidate) {
        return res.status(400).json({ message: 'Пользователь не найден или уже заблокирован' })
      }

      const complaint = new Complaint({ text, author: user.id, userId, type: ComplaintType.USER, status: ComplaintStatus.UNRESOLVED });
      await complaint.save();

      await implementComplaintIdIF(complaint._id.toString());

      return res.json(new UserComplaintDTO({ ...complaint.toObject(), userId: candidate, author: user }));
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: 'Server error' });
    }
  }
}

export default new ComplaintController();
