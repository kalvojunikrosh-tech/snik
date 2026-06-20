import { Router } from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from '../controllers/cartController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Secure all cart endpoints with authentication
router.use(authMiddleware as any);

router.get('/', getCart as any);
router.post('/', addToCart as any);
router.put('/:id', updateCartItem as any);
router.delete('/:id', removeFromCart as any);
router.delete('/', clearCart as any);

export default router;
