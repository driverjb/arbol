class ArbolRequest {
  /**
   *
   * @param {import('express').Request} req
   */
  constructor(req) {
    /** @type {object} */
    this.user = null;
    /** @type {string} */
    this.uuid = null;
    /** @type {object} */
    this.data = {};
    /** @type {string} */
    this.path = req.originalUrl;
    /** @type {string} */
    this.method = req.method;
  }
}

module.exports = ArbolRequest;
