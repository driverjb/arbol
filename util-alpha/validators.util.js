const ArbolError = require('./arbolError.class');
const Joi = require('joi');

function getValidator(type, schema) {
  return function validator(req, res, next) {
    let { error, value } = schema.validate(req[type], { allowUnknown: true });
    if (error) res.arbol.json(new ArbolError({ message: error.message, name: 'BadRequest' }));
    else {
      req[type] = value;
      next();
    }
  };
}

/**
 * Validate the request body against a Joi schema
 * @param {Joi.Schema} schema
 * @param {"replace"|"add"|"delete"} allowedOperands
 */
function bodyValidator(schema, ...allowedOperands) {
  if (allowedOperands.length > 0) {
    schema = Joi.object().keys({
      operand: Joi.string()
        .valid(...allowedOperands)
        .required(),
      content: schema.required()
    });
  }
  return getValidator('body', schema);
}

/**
 * Validate the request parameters against a Joi schema
 * @param {Joi.Schema} schema
 */
function paramValidator(schema) {
  return getValidator('params', schema);
}

/**
 * Validate the request query parameters against a Joi schema
 * @param {Joi.Schema} schema
 */
function queryValidator(schema) {
  return getValidator('query', schema);
}

/**
 * Validate the request headers against a Joi schema
 * @param {Joi.Schema} schema
 */
function headerValidator(schema) {
  return getValidator('headers', schema);
}

module.exports = {
  body: bodyValidator,
  params: paramValidator,
  header: headerValidator,
  query: queryValidator
};
