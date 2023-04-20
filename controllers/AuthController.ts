import { Request, Response } from 'express';
import UserModel from '../models/User';
import RoleModel from '../models/Role';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import TokenService from '../services/TokenService';
import UserDTO from '../dtos/UserDTO';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import User from '../models/User';

class AuthController {
  async registration(req: Request, res: Response) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        res.status(400).json({ message: 'Ошибка при регистрации', errors });
      }

      const { email, password, firstName, lastName } = req.body;
      const candidate = await UserModel.findOne({ email: email.toLowerCase(), });

      if (candidate) {
        return res.status(400).json({ message: 'Пользователь с таким именем уже существует' });
      }

      const hashPassword = bcrypt.hashSync(password, 7);

      const userRole = await RoleModel.findOne({ value: 'USER' });

      const user = new UserModel({ email: email.toLowerCase(), firstName, lastName, password: hashPassword, roles: [userRole] });

      await user.save();

      const userDTO = new UserDTO(user)

      const tokens = TokenService.generateTokens({ ...userDTO });

      res.json(tokens);
    } catch (e) {
      console.log(e);
      res.status(400).json({ message: 'Registration error' })
    }
  }

  async login(req: Request, res: Response) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        res.status(400).json({ message: 'Ошибка при авторизации', errors });
      }

      const { email, password } = req.body;

      const candidate = await UserModel.findOne({ email: email.toLowerCase(), });

      if (!candidate) {
        return res.status(400).json({ message: 'Введенны неверные параметры' });
      }

      const validPassword = bcrypt.compareSync(password, candidate.password);

      if (!validPassword) {
        return res.status(400).json({ message: 'Введенны неверные параметры' });
      }

      const userDTO = new UserDTO(candidate)

      const tokens = TokenService.generateTokens({ ...userDTO });

      res.json(tokens);
    } catch (e) {
      console.log(e);
      res.status(400).json({ message: 'Login error' })
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({ message: 'Пользователь не авторизован' })
      }

      const decodedData = jwt.verify(refreshToken, config.refreshSecret);
      const newTokens = TokenService.generateTokens(decodedData);

      return res.json(newTokens);
    } catch (e) {
      console.log(e);
      return res.status(401).json({ message: 'Пользователь не авторизован' })
    }
  }
}

export default new AuthController();
