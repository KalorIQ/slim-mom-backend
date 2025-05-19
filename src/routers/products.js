import { Router } from 'express';
import ctrlWrapper from '../utils/ctrlWrapper.js';
import {
  getProductsByQuery,
  getAllProducts,
  addProduct,
  removeProduct,
} from '../controllers/products.js';

const router = Router();

router.get('/searchProducts', ctrlWrapper(getProductsByQuery));
router.get('/allProducts', ctrlWrapper(getAllProducts));
router.post('/addProduct', ctrlWrapper(addProduct));
router.delete('/removeProduct', ctrlWrapper(removeProduct));

export default router;
