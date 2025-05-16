import { Router } from 'express';
import ctrlWrapper from '../utils/ctrlWrapper.js';
import validateBody from '/src/middlewares/validateBody';
import { registerUserSchema } from '../validation/auth.js';
import {
  registerController,
  loginController,
  refreshController,
} from '../controllers/auth.js';
import { loginUserSchema } from '../validation/auth.js';
import { logoutUser } from '../controllers/auth.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = Router();

router.post(
  '/register',
  validateBody(registerUserSchema),
  ctrlWrapper(registerController),
);
router.post(
  '/login',
  validateBody(loginUserSchema),
  ctrlWrapper(loginController),
);
router.post('/refresh', ctrlWrapper(refreshController));

router.post('/logout', authenticate, logoutUser);

export default router;
