const express = require('express');
const errors = require('./Errors.module');

function buildCookieResponder(service, cookieName, cookieOptions) {
  return async (req, res) => {
    try {
      let result = service(req);
      if (result instanceof Promise) result = await result;
      res.cookie(
        cookieName ?? 'arbol',
        JSON.stringify(result),
        cookieOptions ?? { httpOnly: true }
      );
      res.arbol.json(result);
    } catch (err) {
      res.arbol.json(err);
    }
  };
}

function buildCookieClearResponder(service, cookieName) {
  return async (req, res) => {
    try {
      let result = service(req);
      if (result instanceof Promise) result = await result;
      res.clearCookie(cookieName);
      res.arbol.json(result);
    } catch (err) {
      res.arbol.json(err);
    }
  };
}

function buildJsonResponder(service) {
  return async (req, res) => {
    try {
      let result = service(req);
      if (result instanceof Promise) result = await result;
      res.arbol.json(result);
    } catch (err) {
      res.arbol.json(err);
    }
  };
}

function buildCsvResponder(service, csvFileName, csvDelimiter) {
  return async (req, res) => {
    try {
      let result = service(req);
      if (result instanceof Promise) result = await result;
      res.arbol.csv(result, csvFileName, csvDelimiter);
    } catch (err) {
      res.arbol.csv(err);
    }
  };
}

class Branch {
  constructor(path) {
    this.router = express.Router();
    this.path = path;
  }
  /**
   * Require permission to access this branch
   * @param {string[]} [groups]
   * @param {string} [groupsKey]
   * @returns {Branch}
   */
  requirePermission(groups = [], groupsKey = 'groups') {
    if (groups.length > 0) {
      this.router.use((req, res, next) => {
        if (req.user) {
          if (groups.some((g) => req.user[groupsKey].some((p) => new RegExp(p, 'i').test(g))))
            next();
          else res.arbol.json(errors.forbidden);
        } else res.arbol.json(errors.unauthorized);
      });
    } else {
      this.router.use((req, res, next) => {
        if (req.user) next();
        else res.arbol.json(errors.unauthorized);
      });
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
   * @param {object} opt How to response to a request
   * @param {"json"|"csv"|"cookie"} opt.responseType
   * @param {string} opt.cookieName
   * @param {import('express').CookieOptions} opt.cookieOptions
   * @param {boolean} opt.cookieClear
   * @param {string} opt.csvFileName
   * @param {string} opt.csvDelimiter
   * @returns {Branch}
   */
  addLeaf(method, path, service, opt = {}) {
    let response = null;
    if (opt.responseType === 'cookie') {
      if (opt.cookieClear) response = buildCookieClearResponder(service, opt.cookieName);
      else response = buildCookieResponder(service, opt.cookieName, opt.cookieOptions);
    } else if (opt.responseType === 'csv') {
      response = buildCsvResponder(service, opt.csvFileName, opt.csvDelimiter);
    } else {
      response = buildJsonResponder(service);
    }
    this.router[method](path, response);
    return this;
  }
}

module.exports = Branch;
