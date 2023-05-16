import { Request, Response } from 'express';
import UserModel, { UserStatus } from '../models/User';
import RoleModel from '../models/Role';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import TokenService from '../services/TokenService';
import UserDTO from '../dtos/UserDTO';
import jwt, { Jwt } from 'jsonwebtoken';
import { config } from '../config';
import { IPService } from '../services/IPService';
import SessionModel from '../models/Session';

class AuthController {
  async registration(req: Request, res: Response) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Ошибка при регистрации', errors });
      }

      const { email, password, firstName, lastName } = req.body;
      const candidate = await UserModel.findOne({ email: email.toLowerCase(), });

      if (candidate) {
        return res.status(400).json({ message: 'Пользователь с таким именем уже существует' });
      }

      const hashPassword = bcrypt.hashSync(password, 7);

      const userRole = await RoleModel.findOne({ value: 'USER' });

      const user = await UserModel.create({ email: email.toLowerCase(), firstName, lastName, password: hashPassword, roles: [userRole?._id] });

      await user.save();

      const userDTO = new UserDTO({ ...user.toObject(), roles: [userRole] })

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
        return res.status(400).json({ message: 'Ошибка при авторизации', errors });
      }

      const { email, password } = req.body;

      const candidate = await UserModel.findOne({ email: email.toLowerCase() }).populate('roles').exec();

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

      const ipRes = IPService.getIp(req);

      if (ipRes.error) {
        return res.status(400).json({ message: 'Введенны неверные параметры' });
      }

      const { ip, geo } = IPService.getIpInfo(ipRes.ip);

      const session = new SessionModel({ ip, city: geo?.city, country: geo?.country });

      await session.save();

      candidate.sessions = [...candidate.sessions, session._id];

      await candidate.save();

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

      if (typeof decodedData !== 'string') {
        const { iat, exp, ...data } = decodedData;
        const user = await UserModel.findOne({ _id: decodedData.id }).populate('sessions').exec();

        if (!user) {
          return res.status(401).json({ message: 'Пользователь не авторизован' })
        }

        if (user.status === UserStatus.BANNED) {
          return res.status(401).json({ message: 'Пользователь заблокирован' })
        }

        const ipRes = IPService.getIp(req);

        if (ipRes.ip) {
          if (!user.sessions.find((it: any) => it.ip === ipRes.ip)) {
            return res.status(401).json({ message: 'Пользователь не авторизован' })
          }
        }
        const newTokens = TokenService.generateTokens(data);

        return res.json(newTokens);
      }
    } catch (e) {
      console.log(e);
      return res.status(401).json({ message: 'Пользователь не авторизован' })
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const user = (req as any).user;

      const candidate = await UserModel.findOne({ _id: user.id }).populate('sessions').exec();

      if (!candidate) {
        return res.status(401).json({ message: 'Пользователь не авторизован' })
      }

      const ipRes = IPService.getIp(req);

      if (ipRes.ip) {
        const session = candidate.sessions.find((it: any) => it.ip === ipRes.ip);
        if (!session) {
          return res.status(401).json({ message: 'Пользователь не авторизован' })
        } else {
          candidate.sessions = candidate.sessions.filter((it: any) => it.ip !== ipRes.ip).map(it => it._id);
          await candidate.save();
          await SessionModel.findOneAndDelete({ _id: session._id });
        }
      }

      return res.status(200).json({ message: 'Success' })
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: 'Server error' })
    }
  }

  async logoutSession(req: Request, res: Response) {
    try {
      const { sessionId } = req.body;
      const user = (req as any).user;

      const candidate = await UserModel.findOne({ _id: user.id });

      if (!candidate) {
        return res.status(401).json({ message: 'Пользователь не авторизован' })
      }

      candidate.sessions = candidate.sessions.filter((it: any) => it !== sessionId);
      await candidate.save();

      await SessionModel.findOneAndDelete({ _id: sessionId });

      return res.status(200).json({ message: 'Success' })
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: 'Server error' })
    }
  }
}

export default new AuthController();
