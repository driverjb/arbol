const ArbolError = require('./ArbolError.class');
const errors = require('./Errors.module');

/**
 * Validate incoming requests
 * @param {"params"|"query"|"headers"|"body"|"all"} param
 * @param {import('joi').ObjectSchema} schema
 */
function getValidator(param, schema, errorName, allowUnknown = false) {
  return (req) => {
    let toCheck = null;
    if (param === 'all') {
      toCheck = { ...req.params, ...req.headers, ...req.query, ...req.body };
      allowUnknown = true;
    } else toCheck = req[param];
    let { value, error } = schema.validate(toCheck, { allowUnknown });
    if (error) throw new ArbolError({ message: error.message, name: errorName, code: 400 });
    else req[param] = value;
  };
}

/**
 * Get a function that will check incoming body parameters
 * @param {import('joi').ObjectSchema} schema
 */
module.exports.body = (schema, allowUnknown = true) =>
  getValidator('body', schema, 'InvalidBody', allowUnknown);

/**
 * Get a function that will check incoming query parameters
 * @param {import('joi').ObjectSchema} schema
 */
module.exports.query = (schema, allowUnknown = true) =>
  getValidator('query', schema, 'InvalidQueryParameters', allowUnknown);

/**
 * Get a function that will check incoming url parameters
 * @param {import('joi').ObjectSchema} schema
 */
module.exports.params = (schema, allowUnknown = true) =>
  getValidator('params', schema, 'InvalidUrlParameters', allowUnknown);

/**
 * Get a function that will check incoming headers
 * @param {import('joi').ObjectSchema} schema
 */
module.exports.headers = (schema, allowUnknown = true) =>
  getValidator('headers', schema, 'InvalidHeaders', allowUnknown);

/**
 * Get a function that will check all of the incoming values (headers, params, query, and body) as one unit
 * @param {import('joi').ObjectSchema} schema
 */
module.exports.all = (schema, allowUnknown = true) =>
  getValidator('all', schema, 'InvalidRequest', allowUnknown);

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
