import { Router } from 'express';
import { body } from 'express-validator';
import AuthController  from '../controllers/AuthController';
import { required } from '../middleware/ValdiationMiddlewares';
import { authMiddleware } from '../middleware/AuthMiddleware';

const router = Router();

router.post('/registration', [
  required('email').isEmail(),
  required('firstName'),
  required('lastName'),
  required('password').isLength({ min: 4, max: 30 }),
], AuthController.registration);
router.post('/login',[
  required('email'),
  required('password'),
], AuthController.login);
router.post('/refresh', AuthController.refreshToken);
router.post('/logout', authMiddleware, AuthController.logout);
router.post('/logout/session', authMiddleware, AuthController.logoutSession);

export default router;
