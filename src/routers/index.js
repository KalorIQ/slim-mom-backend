import { Router } from 'express';
import authRouter from './auth.js';
import userRouter from './user.js';
import productRouter from './products.js';

const router = Router();

router.use('/auth', router);
router.use('/user', router);
router.use('/products', router);

export default router;
