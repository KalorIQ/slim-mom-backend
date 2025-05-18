import express from 'express';
import { pinoHttp } from 'pino-http';
import cors from 'cors';
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
  app.use(cors());
  app.use(cookieParser());

  // Serve static files from the public directory
  app.use(express.static(path.join(__dirname, '../public')));

  // Log all requests with more details
  app.use((req, res, next) => {
    console.log('Request details:');
    console.log(`Method: ${req.method}`);
    console.log(`URL: ${req.url}`);
    console.log(`Base URL: ${req.baseUrl}`);
    console.log(`Original URL: ${req.originalUrl}`);
    console.log('Headers:', req.headers);
    console.log('Query:', req.query);
    console.log('Body:', req.body);
    console.log('-------------------');
    next();
  });

  app.use(
    pinoHttp({
      transport: {
        target: 'pino-pretty',
      },
    }),
  );

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
    console.log(`Server is running on port ${PORT}`);
    console.log('Available routes:');
    console.log('GET /');
    console.log('POST /api/auth/register');
    console.log('POST /api/auth/login');
    console.log('POST /api/auth/refresh');
    console.log('POST /api/auth/logout');
    console.log('POST /api/user/products');
    console.log('GET /api/user/products');
    console.log('DELETE /api/user/products/:id');
    console.log('GET /api/user/my-daily-calories');
    console.log('GET /api/user/my-daily-calory-needs');
    console.log('POST /api/user/daily-calory-needs');
    console.log('GET /api/products/searchProducts');
  });
};
