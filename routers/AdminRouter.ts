import { Router } from 'express';
import { check } from 'express-validator';
import AdminController  from '../controllers/AdminController';
import { authMiddleware }  from '../middleware/AuthMiddleware';
import { roleMiddleware }  from '../middleware/RoleMiddleware';

const router = Router();

router.post('/login',[
  check('username', 'Имя пользователя не может быть пустым').notEmpty(),
  check('password', 'Пароль не может быть пустым').notEmpty(),
], roleMiddleware(['ADMIN']), AdminController.login);
router.get('/roles', authMiddleware, roleMiddleware(['ADMIN']), AdminController.getRoles);

export default router;
