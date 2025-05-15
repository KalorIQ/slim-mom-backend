export const validateBody = (schema) => async (req, res, next) => {
  try {
    await schema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    res.status(400).send({
      message: 'Validation error',
      status: 400,
      errors: error.details.map((detail) => detail.message),
    });
  }
};
