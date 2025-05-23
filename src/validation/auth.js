import Joi from "joi";

export const registerUserSchema = Joi.object({
  name: Joi.string().min(3).max(15).required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  infouser: Joi.object({
    currentWeight: Joi.number().required(),
    height: Joi.number().required(),
    age: Joi.number().required(),
    desireWeight: Joi.number().required(),
    bloodType: Joi.number().required(),
  }),
});

export const loginUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
