import { calculateCalory } from '../utils/calculateCalory.js';
import createHttpError from 'http-errors';
import { getNotAllowedFoodsService } from '../services/user.js';

export const getDailyRateController = async (req, res, next) => {
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
