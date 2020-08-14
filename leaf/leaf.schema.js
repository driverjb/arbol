const Joi = require('joi');

const LeafSchema = Joi.object().keys({
  method: Joi.string()
    .valid('get', 'put', 'patch', 'post', 'delete', 'all')
    .default('get')
    .optional(),
  responder: Joi.func().required(),
  path: Joi.string().default('/'),
  twigs: Joi.array().items(Joi.func()).optional()
});

module.exports = LeafSchema;
