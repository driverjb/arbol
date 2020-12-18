const { createHash } = require('crypto');

class JWTAuthority {
  /**
   * @class Security - Provides user security features for Arbol apps
   * @constructor
   * @param {object} opt
   * @param {string} [opt.privateKey] - Key used for signing and validating tokens
   * @param {"HS256"|"HS384"|"HS512"|"RS256"|"RS384"|"RS512"|"PS256"|"PS384"|"PS512"|"ES256"|"ES384"|"ES512"} [opt.algorithm=HS256] - Hashing algorithms used to sign the token
   */
  constructor(opt) {
    if (!opt.algorithm) opt.algorithm = 'HS256';
    if (!opt.privateKey)
      opt.privateKey = createHash('sha256').update(require('uuid').v4()).digest('hex');
    /** @private */
    this.privateKey = opt.privateKey;
    /** @private */
    this.algorithm = opt.algorithm;
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
   * @returns {object}
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

module.exports = JWTAuthority;
