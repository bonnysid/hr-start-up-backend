import { Request, Response } from 'express';
import UserModel, { UserStatus } from '../models/User';
import SessionModel from '../models/Session';
import UserDTO from '../dtos/UserDTO';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import fs from 'fs';
import { v4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import SessionDTO from '../dtos/SessionDTO';
import { IPService } from '../services/IPService';

class UsersController {
  async getUsers(req: Request, res: Response) {
    try {
      const {
        search = '',
      } = req.query;
      const user = (req as any).user
      const users = await UserModel.find({ $and: [
          { email: { $not: new RegExp(user.email) } },
          { email: new RegExp(String(search), 'i') },
        ], status: { $not: new RegExp(UserStatus.BANNED) } }).populate('roles').exec();
      const userDTOS = users.map(it => new UserDTO(it));

      return res.json(userDTOS);
    } catch (e) {
      console.log(e);
      res.status(400).json({ message: 'Users error' })
    }
  }

  async getUser(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const user = await UserModel.findOne({ _id: id, status: { $not: UserStatus.BANNED } }).populate('roles').exec();

      if (!user) {
        return res.status(400).json({ message: 'Пользователь не найден' })
      }

      return res.json(new UserDTO(user));
    } catch (e) {
      console.log(e);
      return res.status(401).json({ message: 'Пользователь не авторизован' })
    }
  }

  async getMe(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        return res.status(401).json({ message: 'Пользователь не авторизован' })
      }

      const decodedData = jwt.verify(token, config.secret);

      const user = await UserModel.findOne({ _id: (decodedData as any).id }).populate('roles').exec();

      return res.json(new UserDTO(user));
    } catch (e) {
      console.log(e);
      return res.status(401).json({ message: 'Пользователь не авторизован' })
    }
  }

  async changePassword(req: Request, res: Response) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Ошибка при смене пароля', errors });
      }

      const { password, newPassword } = req.body;

      const user = (req as any).user;

      const candidate = await UserModel.findOne({ email: user.email });

      if (!candidate) {
        return res.status(400).json({ message: 'Пользователь не найден' });
      }

      if (candidate.status === UserStatus.BANNED) {
        return res.status(401).json({ message: 'Пользователь заблокирован' })
      }

      const validPassword = bcrypt.compareSync(password, candidate.password);

      if (!validPassword) {
        return res.status(400).json({ message: 'Введенны неверные параметры' });
      }

      const hashPassword = bcrypt.hashSync(newPassword, 7);

      const ipRes = IPService.getIp(req);

      const session = await SessionModel.findOne({ ip: ipRes.ip });

      candidate.password = hashPassword;
      if (session) {
        candidate.sessions =  [session._id]
      }
      await candidate.save();

      return res.json({ message: 'Пароль успешно изменен!' });
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: 'Server error' })
    }
  }

  async changeInfo(req: Request, res: Response) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Ошибка при смене информации', errors });
      }

      const { firstName, lastName } = req.body;

      const user = (req as any).user;

      const candidate = await UserModel.findOne({ email: user.email }).populate('roles').exec();

      if (!candidate) {
        return res.status(400).json({ message: 'Пользователь не найден' });
      }

      if (candidate.status === UserStatus.BANNED) {
        return res.status(401).json({ message: 'Пользователь заблокирован' })
      }

      candidate.firstName = firstName;
      candidate.lastName = lastName;
      await candidate.save();

      return res.json({ message: 'Информация успешно изменена!', user: new UserDTO(candidate) });
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: 'Server error' })
    }
  }

  async uploadAvatar(req: Request, res: Response) {
    try {
      const file = (req as any).file;
      const user = (req as any).user;
      if (!file) {
        return res.status(400).send({ message: 'Нет аватара для загрузки' });
      }
      const fileName = user.id;
      const fileExtension = file.originalname.split('.').pop();
      const newFileName = `${v4()}.${fileName}.${fileExtension}`;
      const newFilePath = `avatars/${newFileName}`;
      const publicUrl = `http://${req.headers.host}/avatars/${newFileName}`;

      const userFromDB = await UserModel.findOne({ _id: user.id });

      if (userFromDB) {
        if (userFromDB.avatar) {
          fs.unlinkSync(userFromDB.avatar?.replace(`http://${req.headers.host}/`, ''))
        }
        userFromDB.avatar = publicUrl;
        await userFromDB.save();
      }

      fs.renameSync(file.path, newFilePath);

      return res.status(200).send({ message: 'Фото обновлено', url: publicUrl });
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: 'Server error' })
    }
  }

  async getSessions(req: Request, res: Response) {
    try {
      const user = (req as any).user;

      const candidate = await UserModel.findOne({ email: user.email }).populate('sessions').exec();

      if (!candidate) {
        return res.status(400).json({ message: 'Пользователь не найден' });
      }

      if (candidate.status === UserStatus.BANNED) {
        return res.status(401).json({ message: 'Пользователь заблокирован' })
      }

      const ipRes = IPService.getIp(req);

      return res.status(200).json(candidate.sessions.map((it: any) => new SessionDTO(it, it.ip === ipRes.ip)))
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: 'Server error' })
    }
  }
}

export default new UsersController();
