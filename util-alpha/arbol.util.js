const ArbolError = require('../util/ArbolError.class');
const ArbolResponder = require('./arbolResponder.class');
const Branch = require('./branch.class');
const express = require('express');
const Joi = require('joi');

/**
 * @typedef Configuration
 * @property {"0.0.0.0"|"localhost"} Configuration.host
 * @property {number} Configuration.port
 * @property {boolean} Configuration.production
 * @property {boolean|number} Configuration.trustProxy
 * @property {string} Configuration.poweredByHeader
 */

const configSchema = Joi.object().keys({
  host: Joi.string().valid('0.0.0.0', 'localhost').default('0.0.0.0').optional(),
  port: Joi.number().default(3000).optional(),
  production: Joi.boolean()
    .default(process.env.NODE_ENV === 'production')
    .optional(),
  trustProxy: Joi.alternatives().try(Joi.boolean(), Joi.number()).default(false).optional(),
  poweredByHeader: Joi.string().default('Arbol')
});

/**
 * Initialize Arbol tools over an express application
 * @param {express.Application} app
 * @param {Configuration} config
 */
module.exports.init = (app, config) => {
  let temp = configSchema.validate(config);
  if (temp.error) throw temp.error;
  else config = temp.value;
  app.disable('debug');
  app.disable('x-powered-by');
  app.set('trust proxy', config.trustProxy);
  app.arbol = {};
  /**
   * Add a branch to the application
   * @param {Branch} branch
   */
  app.arbol.addBranch = (branch) => {
    if (branch.path) app.use(branch.path, branch.router);
    else app.use(branch.router);
  };
  app.use((req, res, next) => {
    req.arbol = {};
    res.arbol = new ArbolResponder(req, res);
    next();
  });
};

module.exports.middleware = {
  globalErrorHandler: (err, req, res, next) => res.arbol.json(err),
  /**
   * Add uuid to every request in the path: req.arbol.uuid
   * @param {function} generator a function that returns a uuid string
   */
  addUUIDForEachRequest: (generator) => {
    return (req, res, next) => {
      req.arbol.uuid = generator();
      next();
    };
  }
};
