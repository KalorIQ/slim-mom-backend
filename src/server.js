import express from 'express';
import pinoHttp from 'pino-http';
import cors from 'cors';
import dotenv from 'dotenv';


export function setupServer() {
  dotenv.config();

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

  app.use((err, req, res, next) => {
    res.status(500).json({
      message: 'Something went wrong',
    });
  });


  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
}
