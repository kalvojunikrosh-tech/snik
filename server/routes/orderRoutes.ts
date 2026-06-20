import { Router } from 'express';
import { createOrder, getMyOrders, getOrderById } from '../controllers/orderController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware as any);

router.post('/', createOrder as any);
router.get('/', getMyOrders as any);
router.get('/:id', getOrderById as any);

export default router;
