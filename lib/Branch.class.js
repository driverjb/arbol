const express = require('express');
const ArbolError = require('./ArbolError.class');
const errors = require('./Errors.module');

class Branch {
  constructor(path) {
    this.router = express.Router();
    this.path = path;
  }
  /**
   * Require permission to access this branch. Passing false will bypass permissions.
   * This is mainly used when you are going to always include a configurable permission
   * @param {string[]|boolean} [groups]
   * @param {string} [groupsKey]
   * @returns {Branch}
   */
  requirePermission(groups = [], groupsKey = 'groups') {
    if (typeof groups != 'boolean') {
      if (groups.length > 0) {
        this.router.use((req, res, next) => {
          if (req.user instanceof ArbolError || req.user == null)
            res.arbol.respond(req.user || errors.unauthorized);
          else {
            if (groups.some((g) => req.user[groupsKey].some((p) => new RegExp(p, 'i').test(g))))
              next();
            else res.arbol.respond(errors.forbidden);
          }
        });
      } else {
        this.router.use((req, res, next) => {
          if (req.user instanceof ArbolError || req.user == null)
            res.arbol.respond(req.user || errors.unauthorized);
          else next();
        });
      }
    }
    return this;
  }
  /**
   * Attach another branch to this branch
   * @param {Branch} branch
   */
  addBranch(branch) {
    this.router.use(branch.path, branch.router);
    return this;
  }
  /**
   *
   * @param {"get"|"put"|"post"|"delete"|"patch"} method
   * @param {string} path
   * @param {function} service A function that receives an arbol augmented express request object and returns either a promise or result
   * @param {object} opt
   * @param {string} opt.cookieClear Set to the name of the cookie that needs to be cleared
   * @returns {Branch}
   */
  addLeaf(method, path, service, opt = {}) {
    let response = null;
    //This could be in the responder, but there is typically only a single function that clears a cookie - logout.
    //No need to check an if for literally every call when its always false except on logout
    if (opt.cookieClear) {
      response = async (req, res) => {
        try {
          let result = service(req);
          if (result instanceof Promise) result = await result;
          res.clearCookie(opt.cookieClear);
          res.arbol.respond(result);
        } catch (err) {
          res.arbol.respond(err);
        }
      };
    } else {
      response = async (req, res) => {
        try {
          let result = service(req);
          if (result instanceof Promise) result = await result;
          res.arbol.respond(result);
        } catch (err) {
          res.arbol.respond(err);
        }
      };
    }
    this.router[method](path, response);
    return this;
  }
}

module.exports = Branch;
