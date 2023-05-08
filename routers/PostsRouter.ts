import { Router } from 'express';
import PostsController  from '../controllers/PostsController';
import { authMiddleware } from '../middleware/AuthMiddleware';
import bodyParser from 'body-parser';
import multer from 'multer';
import { required } from '../middleware/ValdiationMiddlewares';

const router = Router();

const upload = multer({ dest: 'videos/' });

router.post(
  '/create',
  upload.single('video'),
  bodyParser.urlencoded({ extended: true }),
  authMiddleware,
  [
    required('title'),
    required('description'),
    required('shortDescription'),
  ],
  PostsController.createPost
);
router.get('/', PostsController.getPosts);
router.get('/me', authMiddleware, PostsController.getMyPosts);
router.get('/:id', PostsController.getPost);
router.get('/user/:userId', PostsController.getUserPosts);
router.delete('/delete/:id', authMiddleware, PostsController.deletePost);
router.get('/favorites', authMiddleware, PostsController.getFavoritePosts);
router.post('/favorite/:id', authMiddleware, PostsController.favoritePost);
router.post('/unfavorite/:id', authMiddleware, PostsController.unFavoritePost);

export default router;
