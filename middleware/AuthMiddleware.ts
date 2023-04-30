import e, { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import UserModel, { UserStatus } from '../models/User';
import { IPService } from '../services/IPService';

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'OPTIONS') {
    next();
  }

  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Пользователь не авторизован' })
    }

    const decodedData: any = jwt.verify(token, config.secret);

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

    (req as any).user = decodedData;

    next();
  } catch (e) {
    console.log(e);
    return res.status(401).json({ message: 'Пользователь не авторизован' })
  }
}

export { authMiddleware };
