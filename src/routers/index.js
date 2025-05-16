import { Router } from 'express';

const router = Router();

router.use('/auth', authRouter);
router.use('/user', userRouter);
router.use('/products', productRouter);

export default router;
