import { Router } from 'express';
import PostsController  from '../controllers/PostsController';
import { authMiddleware } from '../middleware/AuthMiddleware';

const router = Router();

router.post('/create', authMiddleware, PostsController.createPost);
router.get('/', PostsController.getPosts);

export default router;
