import { Router } from 'express';
import { getRecommendations } from '../controllers/recommendationController.js';

const router = Router();

router.post('/', getRecommendations);

export default router;
