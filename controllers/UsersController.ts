import { Request, Response } from 'express';
import UserModel from '../models/User';
import UserDTO from '../dtos/UserDTO';
import jwt from 'jsonwebtoken';
import { config } from '../config';

class UsersController {
  async getUsers(req: Request, res: Response) {
    try {
      const users = await UserModel.find();
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

      return res.json({ user: decodedData });
    } catch (e) {
      console.log(e);
      return res.status(401).json({ message: 'Пользователь не авторизован' })
    }
  }
}

export default new UsersController();
