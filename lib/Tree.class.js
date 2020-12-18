const express = require('express');
const ArbolError = require('./ArbolError.class');
const ConfigurationSchema = require('./config.schema');
const JWTAuthority = require('./JWTAuthority.class');
const Branch = require('./Branch.class');
const ArbolResponse = require('./ArbolResponse.class');
const ArbolRequest = require('./ArbolRequest.class');
const http = require('http');

/**
 * Return a user disabled error
 * @returns {ArbolError}
 */
function userDisabledError() {
  return new ArbolError({ message: 'Access denied. User is disabled', name: 'Forbidden' });
}

/**
 * Returns a user missing error
 * @private
 * @returns {ArbolError}
 */
function userMissingError() {
  return new ArbolError({ message: 'No user provided', name: 'Unauthorized' });
}

/**
 * Returns the user lacks permission error
 * @private
 * @returns {ArbolError}
 */
function userFailedPermissionCheckError() {
  return new ArbolError({
    message: 'User is missing the required permission for access',
    name: 'InvalidPermission'
  });
}

class Tree {
  /**
   * Initialize Arbol tools over an express application
   * @class Tree
   * @constructor
   * @param {object} opt
   * @param {express.Application} opt.app
   * @param {http.Server} [opt.server]
   * @param {import('./config.schema').Configuration} [opt.config]
   */
  constructor(opt) {
    if (!opt.config) opt.config = {};
    this.app = opt.app;
    this.server = opt.server;
    /** @type {import('./config.schema').Configuration} */
    this.config = opt.config;
    let temp = ConfigurationSchema.validate(this.config);
    if (temp.error) throw temp.error;
    else this.config = temp.value;
    this.app.disable('debug');
    this.app.disable('x-powered-by');
    this.app.set('trust proxy', this.config.trustProxy);
    /**
     * @private
     * @type {JWTAuthority}
     */
    this.jwtAuthority = null;
    /**
     * @private
     * @type {string}
     */
    this.permissionControlFieldName = null;
    this.userActiveFieldName = null;
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ limit: '10mb', extended: true }));
    this.app.use((req, res, next) => {
      req.arbol = new ArbolRequest(req);
      res.arbol = new ArbolResponse(req, res);
      next();
    });
  }
  /**
   * Enable the error handler that will catch all bubbled errors from responses
   * @returns {Tree}
   */
  enableGlobalErrorHandler() {
    this.app.use((err, req, res, next) => res.arbol.json(err));
    return this;
  }
  /**
   * A function that returns a string to be used as the unique identifier for each request.
   * If none is provided, then the v4 uuid from the npm module uuid will be used.
   * @param {()=>string} [generator]
   */
  enableUuidForRequests(generator) {
    let uuidV4 = require('uuid').v4;
    if (generator)
      this.app.use((req, res, next) => {
        req.arbol.uuid = generator();
        next();
      });
    else
      this.app.use((req, res, next) => {
        req.arbol.uuid = uuidV4();
        next();
      });
    return this;
  }
  /**
   * Enable the usage of a jwt key signing system
   * @param {object} opt
   * @param {string} opt.permissionControlFieldName The key to use when inspecting a user object to see if it meets permission requirements
   * @param {string} opt.userActiveFieldName The field used to check that a user object is currently enabled for access
   * @param {string} opt.[privateKey] - Key used for signing and validating tokens
   * @param {"HS256"|"HS384"|"HS512"|"RS256"|"RS384"|"RS512"|"PS256"|"PS384"|"PS512"|"ES256"|"ES384"|"ES512"} [algorithm=HS256] - Hashing algorithms used to sign the token
   */
  enableJWTSecurity(opt) {
    this.permissionControlFieldName = opt.permissionControlFieldName;
    this.userActiveFieldName = opt.userActiveFieldName;
    this.jwtAuthority = new JWTAuthority(opt);
  }
  /**
   * Check that the user is determined to be active
   * @private
   * @param {object} user
   * @returns {boolean}
   */
  _userDisabled(user) {
    return user[this.userActiveFieldName] == false;
  }
  /**
   * Check the users permissions to see if at least one matches the requirements
   * @private
   * @param {object} user
   * @param {string[]} groups
   */
  _userHasPermission(user, groups) {
    /** @type {string[]} */
    let userGroups = user[this.permissionControlFieldName];
    return userGroups.filter((g) => groups.includes(g)).length > 0;
  }
  /**
   * A list of permission controls the user must have at least one of to gain access
   * to the protected branch. If undefined then the presence of a user is all that's required.
   * @param {string[]} [allowedControls]
   */
  getPermissionGateway(allowedControls) {
    if (!this.jwtAuthority)
      throw new Error('You must first enable the security options for an Arbol Tree.');
    //empty array means no permissions required
    if (Array.isArray(allowedControls) && allowedControls.length === 0) allowedControls = undefined;
    if (allowedControls) {
      return (req, res, next) => {
        //no user detected in token - error
        if (!req.arbol.user) req.arbol.user = userMissingError();
        //there is an error instead of a user object - error
        if (req.arbol.user instanceof ArbolError) return res.arbol.json(req.arbol.user);
        else {
          //user is disabled - error
          if (this._userDisabled(req.arbol.user)) return res.arbol.json(userDisabledError());
          //user doesn't have permission - error
          else if (!this._userHasPermission(req.arbol.user, allowedControls))
            return res.arbol.json(userFailedPermissionCheckError());
          //good to go
          else return next();
        }
      };
    } else {
      return (req, res, next) => {
        //no user detected in token - error
        if (!req.arbol.user) req.arbol.user = userMissingError();
        //there is an error instead of a user object - error
        if (req.arbol.user instanceof ArbolError) return res.arbol.json(req.arbol.user);
        else {
          //user is disabled - error
          if (this._userDisabled(req.arbol.user)) return res.arbol.json(userDisabledError());
          //good to go
          else return next();
        }
      };
    }
  }
  /**
   * Spawn a new branch on the tree to work with
   * @param {string} [path]
   * @param {function[]} [twigs] A collection of express middlewares that must be executed in order before reaching the leaf responder
   * @returns {Branch}
   */
  growBranch(path, twigs) {
    let b = new Branch(this, path, twigs);
    if (b.path) this.app.use(b.path, b.router);
    else this.app.use(b.router);
    return b;
  }
  /**
   * Function to call after the server starts
   * @param {()=>void} cb
   */
  start(cb) {
    if (this.server) this.server.listen(this.config.port, this.config.host, cb);
    else this.app.listen(this.config.port, this.app.host, cb);
  }
}

module.exports = Tree;
