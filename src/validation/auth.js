import Joi from 'joi';

export const registerUserSchema = Joi.object({
  name: Joi.string().min(3).max(15).required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  infouser: Joi.object({
    currentWeight: Joi.number(),
    height: Joi.number(),
    age: Joi.number(),
    desireWeight: Joi.number(),
    bloodType: Joi.number(),
  }),
});

export const loginUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
