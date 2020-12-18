const Tree = require('./Tree.class');
const validators = require('./validators.module');
const Leaf = require('./Leaf.class');

class Branch {
  /**
   * A leaf represents an end point to a request. The responder will respond to the user directly.
   * @class Branch
   * @constructor
   * @param {Tree} tree
   * @param {string} [path]
   * @param {function[]} [twigs] A collection of express middlewares that must be executed in order before reaching the leaf responder
   */
  constructor(tree, path, twigs) {
    /** @private */
    this.router = require('express').Router();
    /** @private */
    this.tree = tree;
    /** @type {string} */
    this.path = path;
    if (twigs) this.router.use(...twigs);
  }
  /**
   * Require permission to access this branch
   * @param {string[]} [permissionList] Not defining just requires a valid, enabled user for access. Providing a list will also ensure the user has one of the provided requirements.
   * @returns {Branch}
   */
  requirePermission(permissionList) {
    this.router.use(this.tree.getPermissionGateway(permissionList));
    return this;
  }
  /**
   * Enable request logging
   * @param {function} logFunction that takes an express request object for logging
   * @returns {Branch}
   */
  enableRequestLog(logFunction) {
    this.router.use((req, res, next) => {
      logFunction(req);
      next();
    });
    return this;
  }
  /**
   * Create a new branch that is connected to this branch
   * @param {string} [path]
   * @param {function[]} [twigs] A collection of express middlewares that must be executed in order before reaching the leaf responder
   */
  growBranch(path, twigs) {
    let b = new Branch(this.tree, path, twigs);
    if (b.path) this.router.use(b.path, b.router);
    else this.router.use(b.router);
    return b;
  }
  /**
   * Add a leaf to this branch
   * @param {Leaf} leaf
   * @returns {Branch}
   */
  attachLeaf(leaf) {
    if (leaf.twigs) this.router[leaf.method](leaf.path, ...leaf.twigs, leaf.responder);
    else this.router[leaf.method](leaf.path, leaf.responder);
    return this;
  }
  /**
   * Apply validation rules to the header fields of all requests to this branch
   * @param {import('joi').ObjectSchema} schema
   */
  validateHeader(schema) {
    let v = validators.header(schema);
    this.router.use(v);
    return this;
  }
  /**
   * Apply validation rules to the url param fields of all requests to this branch
   * @param {import('joi').ObjectSchema} schema
   */
  validateParams(schema) {
    let v = validators.params(schema);
    this.router.use(v);
    return this;
  }
  /**
   * Apply validation rules to the query fields of all requests to this branch
   * @param {import('joi').ObjectSchema} schema
   */
  validateQuery(schema) {
    let v = validators.query(schema);
    this.router.use(v);
    return this;
  }
  /**
   * Apply validation rules to the body fields of all requests to this branch
   * @param {import('joi').ObjectSchema} schema
   */
  validateBody(schema) {
    let v = validators.body(schema);
    this.router.use(v);
    return this;
  }
}

module.exports = Branch;
