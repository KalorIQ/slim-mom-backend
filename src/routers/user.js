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
import { getUserActivityStats } from '../controllers/myProducts/getUserActivityStats.js';
import { getWeightHistory } from '../controllers/myProducts/getWeightHistory.js';
import { getMacroBreakdown } from '../controllers/myProducts/getMacroBreakdown.js';
import { getUserAchievements } from '../controllers/myProducts/getUserAchievements.js';
import { getDetailedWeeklyCalories } from '../controllers/myProducts/getDetailedWeeklyCalories.js';
import { getComprehensiveStats } from '../controllers/myProducts/getComprehensiveStats.js';
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

// Analytics endpoints
router.get('/weekly-calories', authenticate, ctrlWrapper(getWeeklyCalories));
router.get('/weight-progress', authenticate, ctrlWrapper(getWeightProgress));
router.get('/stats', authenticate, ctrlWrapper(getUserStats));

// New advanced analytics endpoints
router.get('/activity-stats', authenticate, ctrlWrapper(getUserActivityStats));
router.get('/weight-history', authenticate, ctrlWrapper(getWeightHistory));
router.get('/macro-breakdown', authenticate, ctrlWrapper(getMacroBreakdown));
router.get('/achievements', authenticate, ctrlWrapper(getUserAchievements));
router.get('/weekly-calories-detailed', authenticate, ctrlWrapper(getDetailedWeeklyCalories));
router.get('/comprehensive-stats', authenticate, ctrlWrapper(getComprehensiveStats));

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
