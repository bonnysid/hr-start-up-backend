import { Router } from 'express';
import UsersController  from '../controllers/UsersController';
import { authMiddleware }  from '../middleware/AuthMiddleware';
import multer from 'multer';
import { body } from 'express-validator';

const upload = multer({ dest: 'avatars/' });

const router = Router();

router.get(
  '/',
  authMiddleware,
  UsersController.getUsers
);
router.get(
  '/me',
  authMiddleware,
  UsersController.getMe
);
router.post(
  '/change/password',
  authMiddleware,
  [
    body('password', 'Пароль не может быть пустым').notEmpty(),
    body('newPassword', 'Пароль должен быть больше 4 и меньше 30 символов').isLength({ min: 4, max: 30 }),
  ],
  UsersController.changePassword
);
router.post(
  '/change/info',
  authMiddleware,
  [
    body('firstName', 'Имя не может быть пустым').notEmpty(),
    body('lastName', 'Фамилия не может быть пустой').notEmpty(),
  ],
  UsersController.changeInfo
);
router.post(
  '/avatar',
  upload.single('photo'),
  authMiddleware,
  UsersController.uploadAvatar
);

export default router;
