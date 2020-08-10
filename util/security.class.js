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
  sign(payload) {
    return jwt.sign({ user: payload }, this.privateKey, { algorithm: this.algorithm });
  }
  verify(token) {
    return jwt.verify(token, this.privateKey, { algorithms: [this.algorithm] });
  }
  /**
   * Apply to a branch to control access. No groups provided means only a valid user is required.
   * Groups provided means that the valid user must be a member of at least one of the groups.
   * To require multi-group membership, apply this function repeatedly with each group that is required.
   * @param  {...string} groups
   */
  protectBranch(...groups) {
    if (groups.length > 0) {
      return function (req, res, next) {
        //user failed token validation - error
        if (req.arbol.user instanceof ArbolError) return res.arbol.json(req.arbol.user);
        if (req.arbol.user.groups.filter((group) => groups.includes(group)).length === 0)
          return res.arbol.json(
            new ArbolError({ message: 'Invalid user permissions', name: 'InvalidPermission' })
          );
        return next();
      };
    } else {
      return function (req, res, next) {
        //user failed token validation - error
        if (req.arbol.user instanceof ArbolError) return res.arbol.json(req.arbol.user);
        else return next();
      };
    }
  }
}

module.exports = Security;
