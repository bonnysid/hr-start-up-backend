import { Router } from 'express';
import PostsController, { upload }  from '../controllers/PostsController';
import { authMiddleware } from '../middleware/AuthMiddleware';
import bodyParser from 'body-parser';

const router = Router();

router.post('/create', authMiddleware, PostsController.createPost);
router.post('/createTest', upload.single('video'), bodyParser.urlencoded({ extended: true }), authMiddleware, PostsController.createTestPost);
router.get('/', PostsController.getPosts);

export default router;
