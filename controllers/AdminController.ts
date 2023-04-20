import { Request, Response } from 'express';
import RoleModel from '../models/Role';
import RoleDTO from '../dtos/RoleDTO';
import { validationResult } from 'express-validator';
import UserModel from '../models/User';
import bcrypt from 'bcryptjs';
import UserDTO from '../dtos/UserDTO';
import TokenService from '../services/TokenService';
import jwt from 'jsonwebtoken';
import { config } from '../config';

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

  async login(req: Request, res: Response) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        res.status(400).json({ message: 'Ошибка при авторизации', errors });
      }

      const { email, password } = req.body;

      const candidate = await UserModel.findOne({ email: email.toLowerCase() });

      if (!candidate) {
        return res.status(400).json({ message: 'Введенны неверные параметры' });
      }

      const validPassword = bcrypt.compareSync(password, candidate.password);

      if (!validPassword) {
        return res.status(400).json({ message: 'Введенны неверные параметры' });
      }

      if (!candidate.roles.includes('ADMIN')) {
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

      const rolesDB = await RoleModel.find();

      const user = await UserModel.create({
        email: email.toLowerCase(),
        password: hashPassword,
        firstName,
        lastName,
        phone,
        roles: rolesDB.filter(it => roles.includes(it.id)).map(it => it.value)
      });

      return res.json(new UserDTO(user));
    } catch (e) {
      console.log(e);
      res.status(400).json({ message: 'Create error' })
    }
  }
}

export default new AdminController();
