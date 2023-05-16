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
router.get('/user/:userId', authMiddleware, PostsController.getUserPosts);
router.get('/:id', authMiddleware, PostsController.getPost);
router.delete('/:id', authMiddleware, PostsController.deletePost);
router.put('/:id', authMiddleware, PostsController.editPost);
router.post('/favorite/:id', authMiddleware, PostsController.favoritePost);
router.post('/unfavorite/:id', authMiddleware, PostsController.unFavoritePost);
router.post(
  '/comment',
  authMiddleware,
  [
    required('text'),
  ],
  PostsController.addCommentToPost
);
router.put(
  '/comment/:id',
  authMiddleware,
  [
    required('text'),
  ],
  PostsController.editComment
);
router.delete('/comment/:id', authMiddleware, PostsController.removeComment);

export default router;
