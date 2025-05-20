import { Router } from 'express';
import ctrlWrapper from '../utils/ctrlWrapper.js';
import {
  getProductsByQuery,
  getAllProducts,
  addProduct,
  removeProduct,
} from '../controllers/products.js';

const router = Router();

// Herkes erişebilir.
router.get('/searchProducts', ctrlWrapper(getProductsByQuery));

// Herkes erişebilir.
router.get('/allProducts', ctrlWrapper(getAllProducts));

// Ürün ekleme ve silme işlemi sadece admin için.
router.post('/addProduct', ctrlWrapper(addProduct));
router.delete('/removeProduct', ctrlWrapper(removeProduct));

export default router;
