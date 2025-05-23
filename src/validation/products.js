// eslint-disable-next-line no-undef
const Joi = require('joi');

export const validateSearch = (req, res, next) => {
  const schemaSearch = Joi.object({
    product: Joi.string().required().min(3),
  });

  const validation = schemaSearch.validate(req.query);

  if (validation.error) {
    const [{ message }] = validation.error.details;

    return res
      .status(400)
      .json({ message: `field ${message.replace(/"/g, '')}` });
  } else {
    next();
  }
};
// eslint-disable-next-line no-unused-vars
const validateDate = (req, res, next) => {
  const schemaDate = Joi.object({
    date: Joi.string()
      .required()
      .pattern(new RegExp('^[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]$')),
  });

  const validation = schemaDate.validate(req.params);

  if (validation.error) {
    const [{ message }] = validation.error.details;

    return res
      .status(400)
      .json({ message: `field ${message.replace(/"/g, '')}` });
  } else {
    next();
  }
};

export const validateAddProduct = (req, res, next) => {
  const schemaAuth = Joi.object({
    title: Joi.string().required().min(3),
    weight: Joi.number().required(),
    kcal: Joi.number().required(),
  });

  const validation = schemaAuth.validate(req.body);

  if (validation.error) {
    const [{ context }] = validation.error.details;
    const { label } = context;
    return res
      .status(400)
      .json({ message: `missing required '${label}' field` });
  } else {
    next();
  }
};
