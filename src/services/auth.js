import userCollection from '../db/models/user.js';
import bcrypt from 'bcrypt';
import SessionCollection from '../db/models/session.js';
import createHttpError from 'http-errors';
import { randomBytes } from 'crypto';

import { accessTokenLifetime, refreshTokenLifetime } from '../constants/user.js';
import jwt from 'jsonwebtoken';

import { sendMail } from '../utils/sendMail.js';
import path from 'node:path';
import fs from 'node:fs/promises';
import handlebars from 'handlebars';
import { calculateCalory } from '../utils/calculateCalory.js';

// eslint-disable-next-line no-undef
const TEMPLATES_DIR = path.join(process.cwd(), 'src', 'templates');

const createSession = () => {
  const accessToken = randomBytes(30).toString('hex');
  const refreshToken = randomBytes(30).toString('hex');
  const accessTokenValidUntil = new Date(Date.now() + accessTokenLifetime);
  const refreshTokenValidUntil = new Date(Date.now() + refreshTokenLifetime);

  return {
    accessToken,
    refreshToken,
    accessTokenValidUntil,
    refreshTokenValidUntil,
  };
};

export const registerUser = async (payload) => {
  const { email, password, infouser } = payload;

  const user = await userCollection.findOne({ email });
  if (user) {
    throw createHttpError(409, 'Email in use');
  }

  const hashPassword = await bcrypt.hash(password, 10);

  // Handle the case where infouser is not provided
  let userInfoData = {};

  // Helper function to check if a value is a valid positive number
  const isValidNumber = (value) => {
    return value !== null && value !== undefined && !isNaN(value) && Number(value) > 0;
  };

  // Check if all required fields are provided and are valid numbers
  const hasCompleteValidInfo =
    infouser &&
    isValidNumber(infouser.currentWeight) &&
    isValidNumber(infouser.height) &&
    isValidNumber(infouser.age) &&
    isValidNumber(infouser.desireWeight);

  if (hasCompleteValidInfo) {
    // If all required infouser fields are provided and valid, calculate dailyRate
    userInfoData = {
      ...infouser,
      dailyRate: calculateCalory({
        currentWeight: Number(infouser.currentWeight),
        height: Number(infouser.height),
        age: Number(infouser.age),
        desireWeight: Number(infouser.desireWeight),
      }),
    };
  } else {
    // If infouser is not provided, create empty object with default values
    userInfoData = {
      currentWeight: null,
      height: null,
      age: null,
      desireWeight: null,
      bloodType: null,
      dailyRate: null,
      notAllowedProducts: null,
      notAllowedProductsAll: null,
    };
  }

  const data = await userCollection.create({
    ...payload,
    password: hashPassword,
    infouser: userInfoData,
  });

  delete data._doc.password;

  return data._doc;
};

export const getUser = async (email) => {
  try {
    const userAuth = await userCollection.findOne({ email: email });
    return userAuth;
  } catch (e) {
    throw new Error('Failed to fetch users', e);
  }
};

// const ACCESS_TOKEN_EXPIRY = '15m';
// const REFRESH_TOKEN_EXPIRY = '30d';

export const loginUser = async (payload) => {
  const { email, password } = payload;
  const user = await userCollection.findOne({ email });
  if (!user) {
    throw createHttpError(401, 'Email or password invalid');
  }

  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw createHttpError(401, 'Email or password invalid');
  }

  // Delete any existing sessions for this user
  await SessionCollection.deleteMany({ userId: user._id });

  const sessionData = createSession();

  const userSession = await SessionCollection.create({
    userId: user._id.toString(), // Convert ObjectId to string
    ...sessionData,
  });

  // Add user data to the session object
  const sessionWithUser = {
    ...userSession.toObject(),
    user: {
      name: user.name,
      email: user.email,
      infouser: user.infouser,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  };

  return sessionWithUser;
};

export const findSessionByAccessToken = (accessToken) => SessionCollection.findOne({ accessToken });

export const refreshSession = async ({ refreshToken, sessionId }) => {
  const oldSession = await SessionCollection.findOne({
    _id: sessionId,
    refreshToken,
  });

  if (!oldSession) {
    throw createHttpError(401, 'Session not found');
  }

  if (new Date() > oldSession.refreshTokenValidUntil) {
    throw createHttpError(401, 'Session token expired');
  }

  await SessionCollection.deleteOne({ _id: sessionId });

  const sessionData = createSession();

  const userSession = await SessionCollection.create({
    userId: oldSession.userId,
    ...sessionData,
  });

  return userSession;
};

export const refreshUser = async ({ sessionId, refreshToken }) => {
  try {
    const session = await SessionCollection.findOne({
      _id: sessionId,
      refreshToken,
    });
    if (!session) {
      throw createHttpError(404, 'Session not found');
    }
    const isSessionTokenExpired = new Date() > new Date(session.refreshTokenValidUntil);

    if (isSessionTokenExpired) {
      throw createHttpError(401, 'Session token expired');
    }

    const newSession = createSession();

    await SessionCollection.deleteOne({ _id: sessionId, refreshToken });

    return await SessionCollection.create({
      userId: session.userId,
      ...newSession,
    });
  } catch (e) {
    throw createHttpError(e.status || 500, e.message);
  }
};

export const logout = async (sessionId) => {
  await SessionCollection.deleteOne({ _id: sessionId });
};

export const findUser = (filter) => userCollection.findOne(filter);

export const requestResetToken = async (email) => {
  const user = await userCollection.findOne({ email });
  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  const resetToken = jwt.sign(
    {
      sub: user._id,
      email: user.email,
    },
    // eslint-disable-next-line no-undef
    process.env.JWT_SECRET,
    {
      expiresIn: '15m',
    },
  );

  const templatePath = path.join(TEMPLATES_DIR, 'reset-password-mail.html');
  const templateContent = await fs.readFile(templatePath, 'utf-8');
  const template = handlebars.compile(templateContent.toString());

  const htmlContent = template({
    name: user.name,
    url: `http://localhost:3000/auth/reset-password?token=${resetToken}`,
  });
  await sendMail({
    // eslint-disable-next-line no-undef
    from: process.env.SMTP_FROM,
    to: user.email,
    subject: 'Welcome to Reset Password Mail',
    html: htmlContent,
  });

  return resetToken;
};

export const resetPassword = async (payload) => {
  const { token, password } = payload;

  if (!token) {
    throw createHttpError(400, 'Token is required');
  }

  let decodedToken;
  try {
    // eslint-disable-next-line no-undef
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    if (!decodedToken) {
      throw createHttpError(401, 'Invalid token');
    }
  } catch (error) {
    throw createHttpError(401, 'Invalid token: ' + error);
  }
  const userId = decodedToken.sub;
  const userEmail = decodedToken.email;
  const user = await userCollection.findOne({
    _id: userId,
    email: userEmail,
  });

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await userCollection.findByIdAndUpdate(userId, {
    password: hashedPassword,
  });
  return true;
};
