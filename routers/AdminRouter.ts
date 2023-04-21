import { Router } from 'express';
import { check } from 'express-validator';
import AdminController  from '../controllers/AdminController';
import { authMiddleware }  from '../middleware/AuthMiddleware';
import { roleMiddleware }  from '../middleware/RoleMiddleware';

const router = Router();

router.post('/login',[
  check('email', 'Имя пользователя не может быть пустым').notEmpty(),
  check('password', 'Пароль не может быть пустым').notEmpty(),
], AdminController.login);
router.get('/roles', authMiddleware, roleMiddleware(['ADMIN']), AdminController.getRoles);
router.post('/users/create', authMiddleware, roleMiddleware(['ADMIN']), AdminController.createUser);
router.post('/tags/create', authMiddleware, roleMiddleware(['ADMIN']), AdminController.createTag);
router.post('/roles/create', authMiddleware, roleMiddleware(['ADMIN']), AdminController.createRole);
router.delete('/tags/:id', authMiddleware, roleMiddleware(['ADMIN']), AdminController.deleteTag);
router.put('/tags/:id', authMiddleware, roleMiddleware(['ADMIN']), AdminController.updateTag);
router.delete('/roles/:id', authMiddleware, roleMiddleware(['ADMIN']), AdminController.deleteRole);
router.put('/roles/:id', authMiddleware, roleMiddleware(['ADMIN']), AdminController.updateRole);

export default router;
