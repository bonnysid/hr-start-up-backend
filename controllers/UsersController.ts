import { Request, Response } from 'express';
import UserModel from '../models/User';
import UserDTO from '../dtos/UserDTO';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import fs from 'fs';
import { v4 } from 'uuid';

class UsersController {
  async getUsers(req: Request, res: Response) {
    try {
      const user = (req as any).user
      const users = await UserModel.find({ email: { $not: new RegExp(user.email)  } }).populate('roles').exec();
      const userDTOS = users.map(it => new UserDTO(it));

      return res.json(userDTOS);
    } catch (e) {
      console.log(e);
      res.status(400).json({ message: 'Users error' })
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

      return res.json({ user: new UserDTO(user) });
    } catch (e) {
      console.log(e);
      return res.status(401).json({ message: 'Пользователь не авторизован' })
    }
  }

  async uploadAvatar(req: Request, res: Response) {
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
  }
}

export default new UsersController();
