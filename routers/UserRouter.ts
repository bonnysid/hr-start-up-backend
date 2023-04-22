import { Router } from 'express';
import UsersController  from '../controllers/UsersController';
import { authMiddleware }  from '../middleware/AuthMiddleware';
import multer from 'multer';

const upload = multer({ dest: 'avatars/' });

const router = Router();

router.get('/', authMiddleware, UsersController.getUsers);
router.get('/me', authMiddleware, UsersController.getMe);
router.post('/avatar', upload.single('photo'), authMiddleware, UsersController.uploadAvatar);

export default router;
