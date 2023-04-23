import { Router } from 'express';
import PostsController  from '../controllers/PostsController';
import { authMiddleware } from '../middleware/AuthMiddleware';
import bodyParser from 'body-parser';
import multer from 'multer';
import path from 'path';
import { v4 } from 'uuid';

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../videos'));
  },
  filename: (req, file, cb) => {
    cb(null, `${v4()}_${file.originalname}`);
  },
});

export const upload = multer({ storage });

router.post('/create', upload.single('video'), bodyParser.urlencoded({ extended: true }), authMiddleware, PostsController.createPost);
router.get('/', PostsController.getPosts);

export default router;
