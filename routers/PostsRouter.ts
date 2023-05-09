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
router.get('/', authMiddleware, PostsController.getPosts);
router.get('/me', authMiddleware, PostsController.getMyPosts);
router.get('/favorites', authMiddleware, PostsController.getFavoritePosts);
router.get('/:id', PostsController.getPost);
router.get('/user/:userId', PostsController.getUserPosts);
router.delete('/:id', authMiddleware, PostsController.deletePost);
router.post('/favorite/:id', authMiddleware, PostsController.favoritePost);
router.post('/unfavorite/:id', authMiddleware, PostsController.unFavoritePost);
router.post('/comment', authMiddleware, PostsController.addCommentToPost);
router.post('/comment/:id', authMiddleware, PostsController.editComment);
router.delete('/comment/:id', authMiddleware, PostsController.removeComment);

export default router;
