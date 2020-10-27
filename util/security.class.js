const jwt = require('jsonwebtoken');
const ArbolError = require('./arbolError.class');

class Security {
  /**
   * @class Security - Provides user security features for Arbol apps
   * @constructor
   * @param {string} privateKey - Key used for signing and validating tokens
   * @param {"HS256"|"HS384"|"HS512"|"RS256"|"RS384"|"RS512"|"PS256"|"PS384"|"PS512"|"ES256"|"ES384"|"ES512"} algorithm - Hashing algorithms used to sign the token
   */
  constructor(privateKey, algorithm = 'HS256') {
    this.privateKey = privateKey;
    this.algorithm = algorithm;
  }
  /**
   * Sign a new JWT by merging the payload with the default JWT payload
   * @param {Object} payload
   * @param {string} [ttl="24h"] Time format: 1d, 24h, 1440m, 86400s. Default: 24h
   */
  sign(payload, ttl = '24h') {
    return jwt.sign(payload, this.privateKey, {
      algorithm: this.algorithm,
      expiresIn: ttl
    });
  }
  /**
   * Validate a token and return its payload
   * @param {string} token
   */
  verify(token) {
    return jwt.verify(token, this.privateKey, { algorithms: [this.algorithm] });
  }
  /**
   * Return a token's payload. BEWARE! No validation is performed.
   * @param {string} token
   */
  decode(token) {
    return jwt.decode(token);
  }
}

module.exports = Security;
