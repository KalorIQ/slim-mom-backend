// Project: slim-mom-backend
import { startServer } from './server.js';
import { initMongoConnection } from './db/initMongoConnection.js';

const bootstrap = async () => {
  await initMongoConnection();

  startServer();
};

void bootstrap();
