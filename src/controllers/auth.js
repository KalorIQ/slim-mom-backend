import createHttpError from 'http-errors';
import { registerUser, getUser, loginUser, refreshUser } from '../services/auth.js';
import sessionCollection from '../db/models/session.js';
import { ONE_DAY } from '../constants/user.js';
import { sendMail } from '../utils/sendMail.js';
import User from '../db/models/user.js';
import fs from 'fs/promises';
import path from 'path';
import jwt from 'jsonwebtoken';
import { env } from '../utils/env.js';
import process from 'process';

// import { resetPassword } from '../services/auth.js';

const setupSessionCookies = (res, session) => {
  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + ONE_DAY),
  });
  res.cookie('sessionId', session._id, {
    httpOnly: true,
    expires: new Date(Date.now() + ONE_DAY),
  });
};

export const registerUserController = async (req, res, next) => {
  try {
    const { name, email, password, infouser } = req.body;
    const existingUser = await getUser(email);

    if (existingUser) {
      return next(createHttpError(409, 'Email in use'));
    }

    const newUser = await registerUser({ name, email, password, infouser });

    // Create session for the new user
    // We need to use the original password, not a potentially re-hashed one if loginUser hashes it.
    const session = await loginUser({ email, password: req.body.password });

    setupSessionCookies(res, session);

    res.status(201).json({
      status: 201,
      message: 'Successfully registered and logged in a user!',
      data: {
        accessToken: session.accessToken,
        user: {
          // Make sure newUser contains all necessary fields, especially infouser
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          infouser: newUser.infouser,
          createdAt: newUser.createdAt,
          updatedAt: newUser.updatedAt,
        },
      },
    });
  } catch (error) {
    if (error.status) {
      next(createHttpError(error.status, error.message));
    } else {
      // Log the error for debugging purposes if it's an unexpected one
      console.error('Unexpected error in registerUserController:', error);
      next(createHttpError(500, error.message || 'Internal Server Error'));
    }
  }
};

export const loginUserController = async (req, res, next) => {
  try {
    const { email } = req.body;
    await sessionCollection.deleteMany({ 'user.email': email });

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
      return res.status(401).json({ message: 'Authorization header not found' });
    }

    const [authType, token] = authHeader.split(' ');
    if (authType !== 'Bearer') {
      return res.status(401).json({ message: 'Authorization must be Bearer type' });
    }

    const refreshToken = req.cookies.refreshToken;
    // const sessionId = req.cookies.sessionId;

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

export const forgotPasswordController = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return next(createHttpError(400, 'Email is required'));
    }

    const user = await User.findOne({ email });
    if (!user) {
      return next(createHttpError(404, 'User not found'));
    }

    // Generate a JWT for password reset
    const jwtSecret = env('JWT_PASSWORD_RESET_SECRET');
    if (!jwtSecret) {
      console.error('JWT_PASSWORD_RESET_SECRET is not defined in environment variables.');
      return next(createHttpError(500, 'Internal server error: Missing JWT secret'));
    }

    const resetToken = jwt.sign(
      { userId: user._id },
      jwtSecret,
      { expiresIn: '1h' }, // Token expires in 1 hour
    );

    // Prepare email
    const resetUrl = `${env('APP_DOMAIN')}/reset-password?token=${resetToken}`;

    const templatePath = path.join(process.cwd(), 'src', 'templates', 'reset-password-email.html');
    let emailTemplate = await fs.readFile(templatePath, 'utf8');

    emailTemplate = emailTemplate.replace('{{name}}', user.name);
    emailTemplate = emailTemplate.replace('{{link}}', resetUrl);

    const mailOptions = {
      to: user.email,
      from: env('SMTP_FROM'),
      subject: 'Password Reset Request',
      html: emailTemplate,
    };

    await sendMail(mailOptions);

    res.status(200).json({
      status: 200,
      message: 'Password reset email sent successfully. Please check your inbox.',
      data: {},
    });
  } catch (error) {
    console.error('Error in forgotPasswordController:', error);
    next(createHttpError(error.status || 500, error.message || 'Internal Server Error'));
  }
};

export const sendMailController = async (req, res, next) => {
  try {
    // TODO: Implement send mail logic
    // This will likely involve:
    // 1. Validating request (e.g. to, subject, body)
    // 2. Using a mail service (like Nodemailer with SMTP, or a transactional email API like SendGrid, Mailgun)
    // 3. Sending the email

    res.status(200).json({
      status: 200,
      message: 'Send mail endpoint hit. Logic to be implemented.',
      data: {},
    });
  } catch (error) {
    next(createHttpError(error.status || 500, error.message || 'Internal Server Error'));
  }
};
