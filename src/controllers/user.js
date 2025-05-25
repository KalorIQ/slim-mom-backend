import { calculateCalory } from '../utils/calculateCalory.js';
import createHttpError from 'http-errors';
import {
  getNotAllowedFoodsService,
  updateInfouserService,
} from '../services/user.js';

export const getDailyRateController = async (req, res) => {
  const currentWeight = Number(req.body.currentWeight);
  const height = Number(req.body.height);
  const age = Number(req.body.age);
  const desireWeight = Number(req.body.desireWeight);
  const bloodType = Number(req.body.bloodType);

  const notAllowedFoods = await getNotAllowedFoodsService(bloodType);

  const dailyRate = calculateCalory({
    currentWeight,
    height,
    age,
    desireWeight,
  });

  res.status(200).json({
    status: 200,
    message: 'successfully got daily rate!',
    data: { dailyRate, notAllowedFoods },
  });
};

export const updateInfouserController = async (req, res) => {
  const { _id } = req.user;
  const { currentWeight, height, age, desireWeight, bloodType } = req.body;
  const updatedUser = await updateInfouserService(
    _id,
    currentWeight,
    height,
    age,
    desireWeight,
    bloodType,
  );

  if (!updatedUser) {
    throw createHttpError(404, 'User not found');
  }

  res.status(200).json({
    status: 200,
    message: 'Successfully updated user information!',
    data: updatedUser,
  });
};

export const getMyDailyRateController = async (req, res, next) => {
  if (!req.user) {
    next(createHttpError(401, 'You are not authorized!'));
  }
  const currentWeight = Number(req.user.infouser.currentWeight);
  const height = Number(req.user.infouser.height);
  const age = Number(req.user.infouser.age);
  const desireWeight = Number(req.user.infouser.desireWeight);
  const bloodType = Number(req.user.infouser.bloodType);
  const notAllowedFoods = await getNotAllowedFoodsService(bloodType);

  const dailyRate = calculateCalory({
    currentWeight,
    height,
    age,
    desireWeight,
  });

  res.status(200).json({
    status: 200,
    message: 'Successfully got daily rate!',
    data: { dailyRate, notAllowedFoods },
  });
};
