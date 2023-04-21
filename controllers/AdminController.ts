import { Request, Response } from 'express';
import RoleModel from '../models/Role';
import RoleDTO from '../dtos/RoleDTO';
import { validationResult } from 'express-validator';
import UserModel from '../models/User';
import TagModel from '../models/Tag';
import bcrypt from 'bcryptjs';
import UserDTO from '../dtos/UserDTO';
import TokenService from '../services/TokenService';
import TagDTO from '../dtos/TagDTO';

class AdminController {
  async getRoles(req: Request, res: Response) {
    try {
      const roles = await RoleModel.find();
      const roleDTOS = roles.map(it => new RoleDTO(it));

      return res.json(roleDTOS);
    } catch (e) {
      console.log(e);
      return res.status(403).json({ message: 'Нету доступа' });
    }
  }

  async createTag(req: Request, res: Response) {
    try {
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

  async login(req: Request, res: Response) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        res.status(400).json({ message: 'Ошибка при авторизации', errors });
      }

      const { email, password } = req.body;

      const candidate = await UserModel.findOne({ email: email.toLowerCase() }).populate<{ roles: RoleDTO[] }>('roles').exec();

      if (!candidate) {
        return res.status(400).json({ message: 'Введенны неверные параметры' });
      }

      const validPassword = bcrypt.compareSync(password, candidate.password);

      if (!validPassword) {
        return res.status(400).json({ message: 'Введенны неверные параметры' });
      }

      if (!candidate.roles.map(it => it.value).includes('ADMIN')) {
        return res.status(400).json({ message: 'Введенны неверные параметры' });
      }

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
        res.status(400).json({ message: 'Ошибка при авторизации', errors });
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

      if (candidate) {
        return res.status(400).json({ message: 'Пользователь с таким именем уже существует' });
      }

      const hashPassword = bcrypt.hashSync(password, 7);

      const user = await UserModel.create({
        email: email.toLowerCase(),
        password: hashPassword,
        firstName,
        lastName,
        phone,
        roles,
      });

      return res.json(new UserDTO(user));
    } catch (e) {
      console.log(e);
      res.status(400).json({ message: 'Create error' })
    }
  }

  async updateTag(req: Request, res: Response) {
    try {
      const { value } = req.body;
      const { id } = req.params;
      const candidate = await TagModel.findOne({ _id: id });

      if (!candidate) {
        return res.status(400).json({ message: 'Тег с таким id не найден' });
      }

      candidate.value = value;
      await candidate.save();

      return res.status(200).json(candidate);
    } catch (e) {
      console.log(e);
      res.status(400).json({ message: 'Create error' })
    }
  }

  async deleteTag(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await TagModel.findOneAndDelete({ _id: id });

      return res.status(200);
    } catch (e) {
      console.log(e);
      res.status(400).json({ message: 'Create error' })
    }
  }
}

export default new AdminController();
