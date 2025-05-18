import createHttpError from 'http-errors';
import {
  registerUser,
  getUser,
  loginUser,
  refreshUser,
} from '../services/auth.js';
import jwt from 'jsonwebtoken';
import sessionCollection from '../db/models/session.js';
import { ONE_DAY } from '../constants/user.js';

import { resetPassword } from '../services/auth.js';

export const registerUserController = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const user = await getUser(email);

    if (user) {
      return next(createHttpError(409, 'Email in use'));
    }

    const newUser = await registerUser({ name, email, password });
    
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({
      status: 201,
      message: 'Successfully registered a user!',
      data: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
      },
      token,
    });
  } catch (error) {
    next(createHttpError(500, error));
  }
};

export const loginUserController = async (req, res, next) => {
  try {
    const session = await loginUser(req.body);

    res.cookie('refreshToken', session.refreshToken, {
      httpOnly: true,
      expires: new Date(Date.now() + ONE_DAY),
    });
    res.cookie('sessionId', session._id, {
      httpOnly: true,
      expires: new Date(Date.now() + ONE_DAY),
    });

    res.json({
      status: 200,
      message: 'Successfully logged in an user!',
      data: {
        accessToken: session.accessToken,
        user: session.user,
      },
    });
  } catch (error) {
    next(createHttpError(error.status || 500, error.message));
  }
};

const setupSession = (res, session) => {
  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + ONE_DAY),
  });
  res.cookie('sessionId', session._id, {
    httpOnly: true,
    expires: new Date(Date.now() + ONE_DAY),
  });
};

export const refreshUserController = async (req, res, next) => {
  try {
    const session = await refreshUser({
      sessionId: req.cookies.sessionId,
      refreshToken: req.cookies.refreshToken,
    });
    console.log(session);
    console.log('Cookies:', req.cookies);

    setupSession(res, session);
    res.status(200).json({
      status: 200,
      message: 'Successfully refreshed a session!',
      data: { accessToken: session.accessToken },
    });
  } catch (e) {
    next(createHttpError(e.status || 500, e.message));
  }
};

export const logoutUser = async (req, res, next) => {
  try {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
      return res
        .status(401)
        .json({ message: 'Authorization header not found' });
    }

    const [authType, token] = authHeader.split(' ');
    if (authType !== 'Bearer') {
      return res
        .status(401)
        .json({ message: 'Authorization must be Bearer type' });
    }

    const refreshToken = req.cookies.refreshToken;
    const sessionId = req.cookies.sessionId;

    let session;
    if (token) {
      session = await sessionCollection.findOne({ accessToken: token });
    }

    if (!session && refreshToken) {
      session = await sessionCollection.findOne({ refreshToken });
    }

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    await sessionCollection.findByIdAndDelete(session._id);

    res.clearCookie('refreshToken');
    res.clearCookie('sessionId');

    res.status(200).json({ message: 'Successfully logged out' });
  } catch (error) {
    next(createHttpError(500, error.message || 'Internal Server Error'));
  }
};
