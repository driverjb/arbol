const ArbolError = require('../util/arbolError.class');

class Branch {
  /**
   * @class Branch
   * @constructor
   * @param {string} path - the path that will connect the branch to the tree, or another branch
   */
  constructor(path) {
    this.router = require('express').Router();
    this.path = path;
  }
  /**
   * Check permissions for each request
   * @param {string[]} groups The list of groups allowed to access
   */
  requirePermission(...groups) {
    this.router.use((req, res, next) => {
      if (req.user) {
        if (req.user.groups.filter((g) => groups.includes(g)).length > 0) return next();
      }
      res.arbol.json(
        new ArbolError({
          message: `Missing permission required for access`,
          name: 'InvalidPermission',
        })
      );
    });
    return this;
  }
  /**
   * Enable request logging
   * @param {function} callback that takes an express request object for logging
   */
  enableRequestLog(logCallback) {
    this.router.use((req, res, next) => {
      logCallback(req);
      next();
    });
    return this;
  }
  addBranch(...branches) {
    branches.forEach((branch) => {
      if (branch.path) this.router.use(branch.path, branch.router);
      else this.router.use(branch.router);
    });
    return this;
  }
  addLeaf(...leaves) {
    leaves.forEach((leaf) => {
      if (leaf.twigs) {
        this.router[leaf.method](leaf.path, ...leaf.twigs, leaf.responder);
      } else {
        this.router[leaf.method](leaf.path, leaf.responder);
      }
    });
    return this;
  }
}

module.exports = Branch;