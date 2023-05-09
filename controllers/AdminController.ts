import { Request, Response } from 'express';
import RoleModel from '../models/Role';
import SessionModel from '../models/Session';
import RoleDTO from '../dtos/RoleDTO';
import { validationResult } from 'express-validator';
import UserModel, { UserStatus } from '../models/User';
import TagModel from '../models/Tag';
import PostModel, { PostStatus } from '../models/Post';
import bcrypt from 'bcryptjs';
import UserDTO from '../dtos/UserDTO';
import TokenService from '../services/TokenService';
import TagDTO from '../dtos/TagDTO';
import PostDTO, { PostDetailDTO, PostListItemDTO } from '../dtos/PostDTO';
import geo from 'geoip-lite';
import { IPService } from '../services/IPService';

class AdminController {
  async getRoles(req: Request, res: Response) {
    try {
      const roles = await RoleModel.find();
      const canDeleteEdits: boolean[] = []
      for (let i = 0; i < roles.length; i++) {
        const user = await UserModel.findOne({ roles: { $in: roles[i].id } });
        canDeleteEdits.push(!user);
      }
      const roleDTOS = roles.map((it, i) => {
        return new RoleDTO({ ...it.toObject(), canDeleteEdit: canDeleteEdits[i]})
      });

      return res.json(roleDTOS);
    } catch (e) {
      console.log(e);
      return res.status(403).json({ message: 'Нету доступа' });
    }
  }

  async createTag(req: Request, res: Response) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Ошибка при создании', errors });
      }

      const { value } = req.body;
      const candidate = await TagModel.findOne({ value });

      if (candidate) {
        return res.status(400).json({ message: 'Тег с таким именем уже существует' });
      }

      const tag = new TagModel({ value });
      await tag.save();

      return res.status(200).json(new TagDTO(tag));
    } catch (e) {
      console.log(e);
      res.status(400).json({ message: 'Create error' })
    }
  }

  async createRole(req: Request, res: Response) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Ошибка при создании', errors });
      }

      const { value } = req.body;
      const candidate = await RoleModel.findOne({ value });

      if (candidate) {
        return res.status(400).json({ message: 'Роль с таким именем уже существует' });
      }

      const role = new RoleModel({ value });
      await role.save();

      return res.status(200).json(new RoleDTO(role));
    } catch (e) {
      console.log(e);
      res.status(400).json({ message: 'Create error' })
    }
  }

  async changeUserRoles(req: Request, res: Response) {
    try {
      const { roles, userId } = req.body;

      const user = await UserModel.findOne({ _id: userId });
      if (!user) {
        return res.status(404).json({ message: 'Пользователь не найден' })
      }


      user.roles = roles;
      await user.save();

      return res.status(200).json({ message: 'Роли пользователя успешно обновлены' })
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: 'Server error' })
    }
  }

  async login(req: Request, res: Response) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Ошибка при авторизации', errors });
      }

      const { email, password } = req.body;

      const candidate = await UserModel.findOne({ email: email.toLowerCase() }).populate<{ roles: RoleDTO[] }>('roles').exec();

      if (!candidate) {
        return res.status(400).json({ message: 'Введенны неверные параметры' });
      }

      if (candidate.status === UserStatus.BANNED) {
        return res.status(401).json({ message: 'Пользователь заблокирован' })
      }

      const validPassword = bcrypt.compareSync(password, candidate.password);

      if (!validPassword) {
        return res.status(400).json({ message: 'Введенны неверные параметры' });
      }

      const roles = candidate.roles.map(it => it.value);

      if (!roles.includes('ADMIN') && !roles.includes('MODERATOR') && !roles.includes('OPERATOR')) {
        return res.status(400).json({ message: 'Введенны неверные параметры' });
      }

      const ipRes = IPService.getIp(req);

      if (ipRes.error) {
        return res.status(400).json({ message: 'Введенны неверные параметры' });
      }

      const { ip, geo } = IPService.getIpInfo(ipRes.ip);

      const session = new SessionModel({ ip, city: geo?.city, country: geo?.country });

      await session.save();

      candidate.sessions = [...candidate.sessions, session._id];

      await candidate.save();

      const userDTO = new UserDTO(candidate);

      const tokens = TokenService.generateTokens({ ...userDTO });

      res.json({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
    } catch (e) {
      console.log(e);
      res.status(400).json({ message: 'Login error' })
    }
  }

  async createUser(req: Request, res: Response) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Ошибка при создании', errors });
      }

      const {
        email,
        password,
        firstName,
        lastName,
        phone,
        roles,
      } = req.body;

      const candidate = await UserModel.findOne({ email: email.toLowerCase(), });
      const userRole = await RoleModel.findOne({ value: 'USER' });

      if (candidate) {
        return res.status(400).json({ message: 'Пользователь с таким именем уже существует' });
      }

      const hashPassword = bcrypt.hashSync(password, 7);

      const user = new UserModel({
        email: email.toLowerCase(),
        password: hashPassword,
        firstName,
        lastName,
        phone,
        roles: roles.length ? roles : [userRole?._id],
      });
      await user.save()

      return res.json(new UserDTO(user));
    } catch (e) {
      console.log(e);
      res.status(400).json({ message: 'Create error' })
    }
  }

  async updateTag(req: Request, res: Response) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Ошибка при обновлении', errors });
      }
      const { value } = req.body;
      const { id } = req.params;
      const candidate = await TagModel.findOne({ _id: id });

      if (!candidate) {
        return res.status(400).json({ message: 'Тег с таким id не найден' });
      }

      const post = await PostModel.findOne({ tags: { $in: id } })

      if (!post) {
        candidate.value = value;
        await candidate.save();

        return res.status(200).json(candidate);
      } else {
        res.status(400).json({ message: 'Тег используется в постах' })
      }
    } catch (e) {
      console.log(e);
      res.status(400).json({ message: 'Create error' })
    }
  }

  async deleteTag(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const post = await PostModel.findOne({ tags: { $in: id } })

      if (!post) {
        await TagModel.findOneAndDelete({ _id: id })
        return res.status(200).json({ success: true });
      } else {
        res.status(400).json({ message: 'Тег используется в постах' })
      }

    } catch (e) {
      console.log(e);
      res.status(400).json({ message: 'Delete error' })
    }
  }

  async updateRole(req: Request, res: Response) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Ошибка при обновлении', errors });
      }

      const { value } = req.body;
      const { id } = req.params;
      const candidate = await RoleModel.findOne({ _id: id });

      if (!candidate) {
        return res.status(400).json({ message: 'Роль с таким id не найден' });
      }

      const user = await UserModel.findOne({ roles: { $in: id } })

      if (!user) {
        candidate.value = value;
        await candidate.save();

        return res.status(200).json(candidate);
      } else {
        res.status(400).json({ message: 'Роль используется у пользователей' })
      }
    } catch (e) {
      console.log(e);
      res.status(400).json({ message: 'Update error' })
    }
  }

  async deleteRole(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const user = await UserModel.findOne({ roles: { $in: id } })

      if (!user) {
        await RoleModel.findOneAndDelete({ _id: id });
        return res.status(200).json({ success: true });

      } else {
        res.status(400).json({ message: 'Роль используется у пользователей' })
      }
    } catch (e) {
      console.log(e);
      res.status(400).json({ message: 'Delete error' })
    }
  }

  async getUsers(req: Request, res: Response) {
    try {
      const {
        search = '',
        roles,
        status,
      } = req.query;
      const user = (req as any).user
      const users = await UserModel.find({
        $and: [
          { email: { $not: new RegExp(user.email) } },
          { email: new RegExp(String(search), 'i') },
        ],
        ...(roles ? { roles: { $in: roles } } : {}),
        ...(status ? { status } : {}),
      }).populate('roles').exec();
      const userDTOS = users.map(it => new UserDTO(it));

      return res.json(userDTOS);
    } catch (e) {
      console.log(e);
      res.status(400).json({ message: 'Users error' })
    }
  }

  async getPost(req: Request, res: Response) {
    try {
      const {id} = req.params;

      const post = await PostModel.findOne({ _id: id}).populate([
        {
          path: 'user',
          populate: {
            path: 'roles',
          },
        },
        { path: 'tags' },
        {
          path: 'comments',
          populate: {
            path: 'user',
          },
        }
      ]).exec();

      if (!post) {
        return res.status(404).json({message: 'Пост не найден'})
      }

      post.views += 1;
      await post.save();

      return res.json(new PostDetailDTO(post));
    } catch (e) {
      console.log(e);
      return res.status(500).json({message: 'Server error'});
    }
  }

  async getPosts(req: Request, res: Response) {
    try {
      const {
        search = '',
        tags,
        users,
        status,
      } = req.query;

      const posts = await PostModel.find({
        title: new RegExp(String(search), 'i'),
        ...(tags ? { tags: { $in: tags } } : {}),
        ...(users ? { user: users } : {}),
        ...(status ? { status } : {}),
      }).sort({ createdAt: 'desc' }).populate([{
        path: 'user',
        populate: {
          path: 'roles',
        },
      }, { path: 'tags' }]).exec();

      const postsDTOS = posts.map(it => new PostListItemDTO(it));
      return res.json(postsDTOS);
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  async banUser(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const user = await UserModel.findOne({ _id: id }).populate('roles').exec();

      if (!user) {
        return res.status(400).json({ message: 'Пользователь не найден' })
      }

      if (user.roles.find((role: any) => role.value === 'ADMIN')) {
        return res.status(403).json({ message: 'У вас нет прав для бана этого пользователя!' })
      }

      const posts = await PostModel.find({ user: id });

      if (posts) {
        posts.forEach(post => {
          post.status = PostStatus.BANNED;
          post.save();
        })
      }

      user.status = UserStatus.BANNED;
      await user.save()

      return res.status(200).json({ message: 'Пользователь успешно заблокирован' })
    } catch (e) {
      console.log(e);
      res.status(400).json({ message: 'Ban error' })
    }
  }

  async unbanUser(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const user = await UserModel.findOne({ _id: id })

      if (!user) {
        return res.status(400).json({ message: 'Пользователь не найден' })
      }

      const posts = await PostModel.find({ user: id });

      if (posts) {
        posts.forEach(post => {
          post.status = PostStatus.ACTIVE;
          post.save();
        })
      }

      user.status = UserStatus.ACTIVE;
      await user.save()

      return res.status(200).json({ message: 'Пользователь успешно разблокирован' })
    } catch (e) {
      console.log(e);
      res.status(400).json({ message: 'Unban error' })
    }
  }

  async banPost(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const post = await PostModel.findOne({ _id: id })

      if (!post) {
        return res.status(400).json({ message: 'Пост не найден' })
      }

      post.status = PostStatus.BANNED;
      await post.save()

      return res.status(200).json({ message: 'Пост успешно заблокирован' })
    } catch (e) {
      console.log(e);
      res.status(400).json({ message: 'Ban error' })
    }
  }

  async unbanPost(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const post = await PostModel.findOne({ _id: id })

      if (!post) {
        return res.status(400).json({ message: 'Пост не найден' })
      }

      post.status = PostStatus.ACTIVE;
      await post.save()

      return res.status(200).json({ message: 'Пост успешно разблокирован' })
    } catch (e) {
      console.log(e);
      res.status(400).json({ message: 'Unban error' })
    }
  }
}

export default new AdminController();
