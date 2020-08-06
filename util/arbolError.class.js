const DEFAULT_ERROR_NAME = 'ServerError';
const DEFAULT_ERROR_CODE = 500;

/**
 * @typedef {"BadRequest"|"InvalidRequstParameters"|"Unauthorized"|"InvalidCredentials"|"TokenExpired"|"Forbidden"|"InvalidPermission"|"NotFound"|"DoesNotExist"|"NotImplemented"|"Unavailable"|"ServerError"} ArbolErrorName
 */

function translateCodeFromName(name) {
  switch (name) {
    case 'BadRequest':
    case 'InvalidRequstParameters':
      return 400;
    case 'Unauthorized':
    case 'InvalidCredentials':
    case 'TokenExpired':
      return 401;
    case 'Forbidden':
    case 'InvalidPermission':
      return 403;
    case 'NotFound':
    case 'DoesNotExist':
      return 404;
    case 'NotImplemented':
      return 501;
    case 'Unavailable':
      return 503;
    default:
      return DEFAULT_ERROR_CODE;
  }
}

class ArbolError {
  /**
   * A specialized error for Arbol responses
   * @param {Object} opt
   * @param {string} opt.message The error message details
   * @param {ArbolErrorName} [opt.name] The name of the error
   * @param {number} [opt.code] The http response code for the error
   */
  constructor({ message, name, code } = opt) {
    this.message = message;
    this.name = name;
    this.code = code;
    if (!this.name) this.name = DEFAULT_ERROR_NAME;
    if (!(this.code > 0)) this.code = translateCodeFromName(this.name);
  }
}

module.exports = ArbolError;
