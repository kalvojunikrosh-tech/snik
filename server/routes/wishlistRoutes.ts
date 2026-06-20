import { Router } from 'express';
import { getWishlist, toggleWishlist } from '../controllers/wishlistController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware as any);

router.get('/', getWishlist as any);
router.post('/', toggleWishlist as any);

export default router;
