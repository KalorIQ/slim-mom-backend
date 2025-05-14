import express from 'express';
import pinoHttp from 'pino-http';
import cors from 'cors';
import dotenv from 'dotenv';
import NodeJS from 'node:process';

export function setupServer() {
  dotenv.config();

  var process = NodeJS.Process;
  const PORT = Number(process.env['PORT']);
  const app = express();

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
