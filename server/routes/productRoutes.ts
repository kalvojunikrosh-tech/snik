import { Router } from 'express';
import {
  getAllProducts,
  getProductBySlug,
  createProduct,
  getVirtualDrops,
} from '../controllers/productController.js';

const router = Router();

router.get('/', getAllProducts);
router.get('/drops', getVirtualDrops);
router.get('/:slug', getProductBySlug);
router.post('/', createProduct); // For testing adding custom products

export default router;
