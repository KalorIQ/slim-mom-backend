import express from 'express';
// import { pinoHttp } from "pino-http";
import cors from 'cors'; // Allow requests from different origins
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import authRouter from './routers/auth.js';
import userRouter from './routers/user.js';
import productRouter from './routers/products.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { SwaggerDocs } from './middlewares/swaggerDocs.js';

import { env } from './utils/env.js';
import router from './routers/auth.js';

const PORT = Number(env('PORT', '3000'));

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const startServer = () => {
  const app = express();
  dotenv.config();
  app.use(express.json());
  app.use(
    cors({
      origin: true,
      credentials: true,
    }),
  );
  app.use(cookieParser());

  // Serve static files from the public directory
  app.use(express.static(path.join(__dirname, '../public')));
  // app.use(
  //   pinoHttp({
  //     transport: {
  //       target: "pino-pretty",
  //     },
  //   })
  // );

  app.get('/', (req, res) => {
    res.json({
      message: 'Hello from KalorIQ!',
    });
  });

  app.use(router);
  // swagger docs
  app.use('/api-docs', SwaggerDocs());

  // Mount the routers
  app.use('/api/auth', authRouter);
  app.use('/api/user', userRouter);
  app.use('/api/products', productRouter);

  // handlers for 404 and error
  app.use(notFoundHandler);

  // Error handler middleware
  app.use(errorHandler);

  app.listen(PORT, () => {
    console.info(`Server is running on port ${PORT}`);
  });
};
