import { Router } from 'express';
import { body } from 'express-validator';
import AuthController  from '../controllers/AuthController';

const router = Router();

router.post('/registration', [
  body('email', 'Имя пользователя не может быть пустым').notEmpty().isEmail(),
  body('password', 'Пароль должен быть больше 4 и меньше 30 символов').isLength({ min: 4, max: 30 }),
], AuthController.registration);
router.post('/login',[
  body('email', 'Имя пользователя не может быть пустым').notEmpty(),
  body('password', 'Пароль не может быть пустым').notEmpty(),
], AuthController.login);
router.post('/refresh', AuthController.refreshToken);

export default router;
