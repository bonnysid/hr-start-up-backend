import { Router } from 'express';
import UsersController  from '../controllers/UsersController';
import { authMiddleware }  from '../middleware/AuthMiddleware';
import multer from 'multer';
import { required } from '../middleware/ValdiationMiddlewares';

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
router.get(
  '/sessions',
  authMiddleware,
  UsersController.getSessions
);
router.get(
  '/:id',
  authMiddleware,
  UsersController.getUser
);
router.post(
  '/change/password',
  authMiddleware,
  [
    required('password'),
    required('newPassword').isLength({ min: 4, max: 30 }),
  ],
  UsersController.changePassword
);
router.post(
  '/change/email',
  authMiddleware,
  [
    required('email').isEmail(),
  ],
  UsersController.changeEmail
);
router.post(
  '/change/email/confirm',
  authMiddleware,
  [
    required('code'),
  ],
  UsersController.changeEmailConfirm
);
router.post(
  '/email/confirm',
  authMiddleware,
  [
    required('code'),
  ],
  UsersController.confirmEmail
);
router.post(
  '/email/send/code',
  authMiddleware,
  UsersController.sendVerificationEmailCode
);
router.post(
  '/change/info',
  authMiddleware,
  [
    required('firstName'),
    required('lastName'),
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
