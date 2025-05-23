import { calculateCalory } from '../utils/calculateCalory.js';
import createHttpError from 'http-errors';
import {
  getNotAllowedFoodsService,
  updateInfouserService,
} from '../services/user.js';

export const getDailyRateController = async (req, res) => {
  console.log('In getDailyRateController req.query', req.query);
  console.log('In getDailyRateController req.user', req.user);

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
  console.log('In updateInfouserController req.body', req.body);
  const { _id } = req.user;
  console.log('In updateInfouserController _id', _id);
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
  console.log('In getMyDailyRateController req.user', req.user);
  const currentWeight = Number(req.user.infouser.currentWeight);
  const height = Number(req.user.infouser.height);
  const age = Number(req.user.infouser.age);
  const desireWeight = Number(req.user.infouser.desireWeight);
  const bloodType = Number(req.user.infouser.bloodType);
  console.log('In getMyDailyRateController currentWeight', currentWeight);
  console.log('In getMyDailyRateController height', height);
  console.log('In getMyDailyRateController age', age);
  console.log('In getMyDailyRateController desireWeight', desireWeight);
  console.log('In getMyDailyRateController bloodType', bloodType);

  const notAllowedFoods = await getNotAllowedFoodsService(bloodType);
  console.log('In getMyDailyRateController notAllowedFoods', notAllowedFoods);

  const dailyRate = calculateCalory({
    currentWeight,
    height,
    age,
    desireWeight,
  });
  console.log('In getMyDailyRateController dailyRate', dailyRate);
  res.status(200).json({
    status: 200,
    message: 'Successfully got daily rate!',
    data: { dailyRate, notAllowedFoods },
  });
};
