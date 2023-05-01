import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import RoleDTO from '../dtos/RoleDTO';
import UserModel from '../models/User';

const roleMiddleware = (roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'OPTIONS') {
      next();
    }

    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        return res.status(401).json({message: 'Пользователь не авторизован'})
      }

      const decodedData: any = jwt.verify(token, config.secret);

      const user = await UserModel.findOne({ _id: decodedData.id }).populate('roles').exec();

      let hasRole = false;

      (user as any).roles.forEach((role: RoleDTO) => {
        if (roles.includes(role.value)) {
          hasRole = true;
        }
      });

      if (!hasRole) {
        return res.status(403).json({ message: 'У вас нет доступа' })
      }

      next();
    } catch (e) {
      console.log(e);
      return res.status(401).json({message: 'Пользователь не авторизован'})
    }
  }
}

export { roleMiddleware };
