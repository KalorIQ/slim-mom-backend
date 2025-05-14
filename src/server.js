import express from 'express';
import pinoHttp from 'pino-http';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

export function setupServer() {
  dotenv.config();
  const PORT = process.env.PORT;

  app.use(cors());

  app.use(express.json());

  app.use(
    pinoHttp({
      transport: {
        target: 'pino-pretty',
      },
    }),
  );

  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
}
