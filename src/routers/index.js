import { Router } from 'express';
import authRouter from './auth.js';
import userRouter from './user.js';
import productRouter from './products.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/user', userRouter);
router.use('/products', productRouter);

export default router;
