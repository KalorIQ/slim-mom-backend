import userCollection from '../db/models/user.js';
import bcrypt from 'bcrypt';
import sessionCollection from '../db/models/session.js';
import createHttpError from 'http-errors';
import { randomBytes } from 'crypto';

import {
  accessTokenLifetime,
  refreshTokenLifetime,
} from '../constants/user.js';
import jwt from 'jsonwebtoken';
import { env } from '../utils/env.js';

import { sendMail } from '../utils/sendMail.js';
import path from 'node:path';
import fs from 'node:fs/promises';
import handlebars from 'handlebars';

const TEMPLATES_DIR = path.join(process.cwd(), 'src', 'templates');

const createSession = () => {
  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');
  const accessTokenValidUntil = new Date(Date.now() + accessTokenLifetime);
  const refreshTokenValidUntil = new Date(Date.now() + refreshTokenLifetime);

  return {
    accessToken,
    refreshToken,
    accessTokenValidUntil,
    refreshTokenValidUntil,
  };
};

export const register = async (payload) => {
  const { email, password } = payload;

  const user = await userCollection.findOne({ email }); // Changed from UserCollection to userCollection
  if (user) {
    throw createHttpError(409, 'Email in use');
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const data = await userCollection.create({
    // Changed from UserCollection to userCollection
    ...payload,
    password: hashPassword,
  });
  delete data._doc.password;

  return data._doc;
};

export const login = async (payload) => {
  const { email, password } = payload;
  const user = await userCollection.findOne({ email }); // Changed from UserCollection to userCollection
  if (!user) {
    throw createHttpError(401, 'Email or password invalid');
  }

  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw createHttpError(401, 'Email or password invalid');
  }

  await sessionCollection.deleteOne({ userId: user._id }); // Changed from SessionCollection to sessionCollection

  const sessionData = createSession();

  const userSession = await sessionCollection.create({
    // Changed from SessionCollection to sessionCollection
    userId: user._id,
    ...sessionData,
  });

  return userSession;
};

export const findSessionByAccessToken = (accessToken) =>
  sessionCollection.findOne({ accessToken });

export const refreshSession = async ({ refreshToken, sessionId }) => {
  const oldSession = await sessionCollection.findOne({
    // Changed from SessionCollection
    _id: sessionId,
    refreshToken,
  });

  if (!oldSession) {
    throw createHttpError(401, 'Session not found');
  }

  if (new Date() > oldSession.refreshTokenValidUntil) {
    throw createHttpError(401, 'Session token expired');
  }

  await sessionCollection.deleteOne({ _id: sessionId }); // Changed from SessionCollection

  const sessionData = createSession();

  const userSession = await sessionCollection.create({
    // Changed from SessionCollection
    userId: oldSession._id,
    ...sessionData,
  });

  return userSession;
};

export const logout = async (sessionId) => {
  await sessionCollection.deleteOne({ _id: sessionId }); // Changed from SessionCollection
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
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    if (!decodedToken) {
      throw createHttpError(401, 'Invalid token');
    }
  } catch (error) {
    console.log('error', error);
    throw createHttpError(401, 'Invalid token');
  }
  console.log('decodedToken', decodedToken);

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
