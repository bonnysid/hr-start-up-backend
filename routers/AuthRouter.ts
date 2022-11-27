import { Router } from 'express';
import { check } from 'express-validator';
import AuthController  from '../controllers/AuthController';
import { authMiddleware }  from '../middleware/AuthMiddleware';
import { roleMiddleware }  from '../middleware/RoleMiddleware';

const router = Router();

router.post('/registration', [
  check('username', 'Имя пользователя не может быть пустым').notEmpty(),
  check('password', 'Пароль должен быть больше 4 и меньше 30 символов').isLength({ min: 4, max: 30 }),
], AuthController.registration);
router.post('/login',[
  check('username', 'Имя пользователя не может быть пустым').notEmpty(),
  check('password', 'Пароль не может быть пустым').notEmpty(),
], AuthController.login);
router.post('/refresh', AuthController.refreshToken);
router.get('/users', authMiddleware, roleMiddleware(['ADMIN']), AuthController.getUsers);

export default router;
