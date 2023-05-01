import { Router } from 'express';
import { body } from 'express-validator';
import AdminController  from '../controllers/AdminController';
import { authMiddleware }  from '../middleware/AuthMiddleware';
import { roleMiddleware }  from '../middleware/RoleMiddleware';
import { required } from '../middleware/ValdiationMiddlewares';

const router = Router();

router.post(
  '/login',
  [
    required('email'),
    required('password'),
  ],
  AdminController.login
);
router.get(
  '/roles',
  authMiddleware,
  roleMiddleware(['ADMIN', 'MODERATOR']),
  AdminController.getRoles
);
router.get(
  '/posts',
  authMiddleware,
  roleMiddleware(['ADMIN', 'MODERATOR']),
  AdminController.getPosts
);
router.post(
  '/users/create',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  [
    required('email').isEmail(),
    required('password').isLength({ min: 4, max: 30 }),
    required('firstName'),
    required('lastName'),
  ],
  AdminController.createUser
);
router.get(
  '/users',
  authMiddleware,
  roleMiddleware(['ADMIN', 'MODERATOR']),
  AdminController.getUsers
);
router.post(
  '/tags/create',
  authMiddleware,
  roleMiddleware(['ADMIN', 'MODERATOR']),
  [
    required('value'),
  ],
  AdminController.createTag
);
router.post(
  '/roles/create',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  [
    required('value'),
  ],
  AdminController.createRole
);
router.delete(
  '/tags/:id',
  authMiddleware,
  roleMiddleware(['ADMIN', 'MODERATOR']),
  AdminController.deleteTag
);
router.put(
  '/tags/:id',
  authMiddleware,
  roleMiddleware(['ADMIN', 'MODERATOR']),
  [
    required('value'),
  ],
  AdminController.updateTag
);
router.delete(
  '/roles/:id',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  AdminController.deleteRole
);
router.put(
  '/roles/:id',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  [
    required('value'),
  ],
  AdminController.updateRole
);
router.post(
  '/users/ban/:id',
  authMiddleware,
  roleMiddleware(['ADMIN', 'MODERATOR']),
  AdminController.banUser
);
router.post(
  '/users/unban/:id',
  authMiddleware,
  roleMiddleware(['ADMIN', 'MODERATOR']),
  AdminController.unbanUser
);
router.post(
  '/posts/ban/:id',
  authMiddleware,
  roleMiddleware(['ADMIN', 'MODERATOR']),
  AdminController.banPost
);
router.post(
  '/posts/unban/:id',
  authMiddleware,
  roleMiddleware(['ADMIN', 'MODERATOR']),
  AdminController.unbanPost
);
router.post(
  '/users/change/roles',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  [
    required('userId'),
  ],
  AdminController.changeUserRoles
);

export default router;
