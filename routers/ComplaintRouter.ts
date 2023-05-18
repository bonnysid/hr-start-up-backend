import { Router } from 'express';
import ComplaintController from '../controllers/ComplaintController';
import { authMiddleware }  from '../middleware/AuthMiddleware';
import { roleMiddleware } from '../middleware/RoleMiddleware';
import { required } from '../middleware/ValdiationMiddlewares';

const router = Router();

router.get('/', authMiddleware, roleMiddleware(['ADMIN', 'MODERATOR']), ComplaintController.getComplaints);
router.get('/my', authMiddleware, ComplaintController.getMyComplaints);
router.post(
  '/post',
  authMiddleware,
  [
    required('text'),
    required('postId'),
  ],
  ComplaintController.createPostComplaint
);
router.post(
  '/user',
  authMiddleware,
  [
    required('text'),
    required('userId'),
  ],
  ComplaintController.createUserComplaint
);
router.post(
  '/resolve/:id',
  authMiddleware,
  ComplaintController.resolveComplaint
);
router.post(
  '/close/:id',
  authMiddleware,
  ComplaintController.closeComplaint
);

export default router;
