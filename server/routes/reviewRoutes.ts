import { Router } from 'express';
import { addReview, getProductReviews } from '../controllers/reviewController.js';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/:productId', getProductReviews as any);
router.post('/', authMiddleware as any, addReview as any);

export default router;
