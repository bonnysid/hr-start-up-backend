import { Router } from 'express';
import { check } from 'express-validator';
import AdminController  from '../controllers/AdminController';
import { authMiddleware }  from '../middleware/AuthMiddleware';
import { roleMiddleware }  from '../middleware/RoleMiddleware';

const router = Router();

router.post('/login',[
  check('email', 'Имя пользователя не может быть пустым').notEmpty(),
  check('password', 'Пароль не может быть пустым').notEmpty(),
], AdminController.login);
router.get('/roles', authMiddleware, roleMiddleware(['ADMIN']), AdminController.getRoles);
router.post('/create/user', authMiddleware, roleMiddleware(['ADMIN']), AdminController.createUser);
router.post('/refresh', AdminController.refreshToken);
router.post('/check', AdminController.checkToken);

export default router;
