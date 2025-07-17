import { Router } from 'express';
import authController from '../controllers/authController';
// TODO: import protect middleware

const router = Router();

router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
// router.get('/me', protect, authController.getMe);

export default router;
