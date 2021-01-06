const ArbolError = require('./ArbolError.class');
const errors = require('./Errors.module');

/**
 * Validate incoming requests
 * @param {"params"|"query"|"headers"|"body"} param
 * @param {import('joi').ObjectSchema} schema
 */
function getValidator(param, schema, errorName, allowUnknown = false) {
  return (req) => {
    let { value, error } = schema.validate(req[param], { allowUnknown });
    if (error) throw new ArbolError({ message: error.message, name: errorName, code: 400 });
    else req[param] = value;
  };
}

/**
 * Get a function that will check incoming body parameters
 * @param {import('joi').ObjectSchema} schema
 */
module.exports.body = (schema) => getValidator('body', schema, 'InvalidBody', false);

/**
 * Get a function that will check incoming query parameters
 * @param {import('joi').ObjectSchema} schema
 */
module.exports.query = (schema) => getValidator('query', schema, 'InvalidQueryParameters', false);

/**
 * Get a function that will check incoming url parameters
 * @param {import('joi').ObjectSchema} schema
 */
module.exports.params = (schema) => getValidator('params', schema, 'InvalidUrlParameters', false);

/**
 * Get a function that will check incoming headers
 * @param {import('joi').ObjectSchema} schema
 */
module.exports.params = (schema) => getValidator('headers', schema, 'InvalidHeaders', true);

/**
 * The user must be valid
 * @param {*} req
 */
module.exports.userPresent = (req) => {
  if (!req.user) throw errors.unauthorized;
};

/**
 * Require the user to have at least one of the provided permissions
 * @param {string[]} groups
 * @param {string} [groupKey]
 */
module.exports.userHasGroup = (groups, groupKey = 'groups') => (req) => {
  if (!req.user) throw errors.unauthorized;
  else if (!groups.some((g) => req.user[groupKey].some((p) => new RegExp(p, 'i').test(g))))
    throw errors.forbidden;
};
