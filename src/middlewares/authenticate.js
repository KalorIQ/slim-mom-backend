import createHttpError from "http-errors";
import SessionCollection from "../db/models/session.js";
import userCollection from "../db/models/user.js";

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.get("Authorization");
    if (!authHeader) {
      return next(createHttpError(401, "Authorization header is missing"));
    }

    const [bearer, token] = authHeader.split(" ");
    if (bearer !== "Bearer" || !token) {
      return next(createHttpError(401, "Invalid authorization format"));
    }

    const session = await SessionCollection.findOne({ accessToken: token });

    if (!session) {
      return next(createHttpError(401, "Session not found"));
    }

    if (new Date() > new Date(session.accessTokenValidUntil)) {
      return next(createHttpError(401, "Access token expired"));
    }

    const user = await userCollection.findById(session.userId);
    if (!user) {
      return next(createHttpError(401, "User not found"));
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    next(error);
  }
};
