import { Request, Response } from 'express';
import ComplaintModel, { ComplaintStatus, ComplaintType } from '../models/Complaint';
import PostModel, { PostStatus } from '../models/Post';
import UserModel, { UserStatus } from '../models/User';
import ComplaintDTO, { UserComplaintDTO } from '../dtos/ComplaintDTO';
import { broadCastMessage, MessageEvents } from '../controllers/SocketController';
import Complaint from '../models/Complaint';

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
      ]).sort({ [String(sort)]: sortValueParsed }).exec();

      return res.json(complaints.map(it => new ComplaintDTO(it)));
    } catch (e) {
      console.log(e);
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
      ]).sort({ [String(sort)]: sortValueParsed }).exec();

      return res.json(complaints.map(it => new UserComplaintDTO(it)));
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

      return res.json(new UserComplaintDTO({ ...complaint.toObject(), userId: candidate, author: user }));
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: 'Server error' });
    }
  }
}

export default new ComplaintController();
