import path from 'path';
import createHttpError from 'http-errors';
import swaggerUi from 'swagger-ui-express';
import fs from 'node:fs';

export const SWAGGER_PATH = path.join(process.cwd(), 'docs', 'swagger.json');

export const SwaggerDocs = () => {
  try {
    const swaggerDoc = JSON.parse(fs.readFileSync(SWAGGER_PATH).toString());
    return [...swaggerUI.serve, swaggerUI.setup(swaggerDoc)];
  } catch (err) {
    console.error(err);
    return (req, res, next) =>
      next(createHttpError(500, "Can't load swagger docs"));
  }
};
export const swaggerUI = swaggerUi.serve;
