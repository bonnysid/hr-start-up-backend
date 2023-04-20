import { Router } from 'express';
import UsersController  from '../controllers/UsersController';
import { authMiddleware }  from '../middleware/AuthMiddleware';

const router = Router();

router.get('/', authMiddleware, UsersController.getUsers);
router.get('/me', authMiddleware, UsersController.getMe);

export default router;
