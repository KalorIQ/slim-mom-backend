import path from "path";

export const emailRegexp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
export const accessTokenLifetime = 1000 * 60 * 60 * 24;

export const refreshTokenLifetime = 1000 * 60 * 60 * 24 * 30;
export const ONE_DAY = 24 * 60 * 60 * 1000;
export const SWAGGER_PATH = path.join(
  process.cwd(),
  "src",
  "docs",
  "swagger.json"
);
