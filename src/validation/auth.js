export const loginWithGoogleOAuthSchema = Joi.object({
  code: Joi.string().required(),
});
