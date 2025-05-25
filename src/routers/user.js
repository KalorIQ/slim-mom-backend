import { Router } from 'express';
import {
  getDailyRateController,
  getMyDailyRateController,
} from '../controllers/user.js';
import { validateBody } from '../middlewares/validateBody.js';
import { addMyProductsSchema, getDailyRateSchema, updateInfouserSchema } from '../validation/user.js';
import { addMyProducts } from '../controllers/myProducts/addMyProducts.js';
import { getMyProducts } from '../controllers/myProducts/getMyProducts.js';
import { deleteMyProducts } from '../controllers/myProducts/deleteMyProducts.js';
import { countCalories } from '../controllers/myProducts/countCalories.js';
import { getWeeklyCalories } from '../controllers/myProducts/getWeeklyCalories.js';
import { getWeightProgress } from '../controllers/myProducts/getWeightProgress.js';
import { getUserStats } from '../controllers/myProducts/getUserStats.js';
import { authenticate } from '../middlewares/authenticate.js';
import ctrlWrapper from '../utils/ctrlWrapper.js';
import { updateInfouserController } from '../controllers/user.js';
const router = Router();

router.post(
  '/products',
  validateBody(addMyProductsSchema),
  authenticate,
  ctrlWrapper(addMyProducts),
);

router.get('/products', authenticate, ctrlWrapper(getMyProducts));
router.delete('/products/:id', authenticate, ctrlWrapper(deleteMyProducts));
router.get('/my-daily-calories', authenticate, ctrlWrapper(countCalories));

// New analytics endpoints
router.get('/weekly-calories', authenticate, ctrlWrapper(getWeeklyCalories));
router.get('/weight-progress', authenticate, ctrlWrapper(getWeightProgress));
router.get('/stats', authenticate, ctrlWrapper(getUserStats));

router.get(
  '/my-daily-calory-needs',
  authenticate,
  ctrlWrapper(getMyDailyRateController),
);

router.patch(
  '/infouser-update',
  authenticate,
  validateBody(updateInfouserSchema),
  ctrlWrapper(updateInfouserController),
);

// Zaten Frontendde yapıyoruz.
router.post(
  '/daily-calory-needs',
  validateBody(getDailyRateSchema),
  ctrlWrapper(getDailyRateController),
);

export default router;
