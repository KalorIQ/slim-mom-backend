import { Router } from 'express';
import ctrlWrapper from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';
import { registerUserSchema } from '../validation/auth.js';
import {
  registerUserController,
  refreshUserController,
  logoutUser,
  loginUserController,
  forgotPasswordController,
  sendMailController,
} from '../controllers/auth.js';
import { loginUserSchema } from '../validation/auth.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = Router();

router.post(
  '/register',
  validateBody(registerUserSchema),
  ctrlWrapper(registerUserController),
);
router.post(
  '/login',
  validateBody(loginUserSchema),
  ctrlWrapper(loginUserController),
);
router.post('/refresh', ctrlWrapper(refreshUserController));

router.post('/logout', authenticate, ctrlWrapper(logoutUser));

router.post(
  '/forgot-password',
  // Add validation if needed, e.g., validateBody(forgotPasswordSchema),
  ctrlWrapper(forgotPasswordController),
);

router.post(
  '/send-mail',
  // Add validation if needed, e.g., validateBody(sendMailSchema),
  ctrlWrapper(sendMailController),
);

export default router;
