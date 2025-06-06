import createHttpError from "http-errors";
import swaggerUI from "swagger-ui-express";
import fs from "node:fs";
import { SWAGGER_PATH } from "../constants/index.js";

export const SwaggerDocs = () => {
  try {
    const swaggerDoc = JSON.parse(fs.readFileSync(SWAGGER_PATH).toString());
    return [...swaggerUI.serve, swaggerUI.setup(swaggerDoc)];
  } catch (err) {
    console.error("Failed to load Swagger docs:", err);
    return (req, res, next) =>
      next(createHttpError(500, "Can't load swagger docs"));
  }
};
