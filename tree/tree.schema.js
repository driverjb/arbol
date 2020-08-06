const Joi = require('joi');

module.exports = Joi.object().keys({
  host: Joi.string().valid('0.0.0.0', 'localhost').default('0.0.0.0').optional(),
  port: Joi.number().default(3000).optional(),
  production: Joi.boolean()
    .default(process.env.NODE_ENV === 'production')
    .optional(),
  trustProxy: Joi.alternatives().try(Joi.boolean(), Joi.number()).default(false).optional(),
});
