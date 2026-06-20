import { Router } from 'express';
import {
  register,
  login,
  googleLogin,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
} from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/profile', authMiddleware as any, getProfile as any);
router.put('/profile', authMiddleware as any, updateProfile as any);

export default router;
