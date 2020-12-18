const Joi = require('joi');

/**
 * @typedef Configuration
 * @property {"0.0.0.0"|"localhost"} [Configuration.host]
 * @property {number} [Configuration.port]
 * @property {boolean} [Configuration.production]
 * @property {boolean|number} [Configuration.trustProxy]
 * @property {string} [Configuration.poweredByHeader]
 */

/**
 * Definition for ensuring arbol is provided a complete configuration object
 * @type {Joi.ObjectSchema}
 */
const configSchema = Joi.object().keys({
  host: Joi.string().valid('0.0.0.0', 'localhost').default('0.0.0.0').optional(),
  port: Joi.number().default(3000).optional(),
  production: Joi.boolean()
    .default(process.env.NODE_ENV === 'production')
    .optional(),
  trustProxy: Joi.alternatives().try(Joi.boolean(), Joi.number()).default(false).optional(),
  poweredByHeader: Joi.string().default('Arbol').optional()
});

module.exports = configSchema;
