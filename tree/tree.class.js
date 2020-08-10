const express = require('express');
const HttpServer = require('http').Server;
const OptionsSchema = require('./tree.schema');
const errors = require('../util/errors.util');
const Branch = require('../branch/branch.class');
const ArbolResponder = require('../util/arbolResponder.class');
class Tree {
  /**
   * @class Tree - This is the foundation of an arbol project. The Tree instance houses
   * the http server, express server, and other foundational parts of the web service.
   * @param {Object} opt - Options for starting up a Tree
   * @param {"localhost"|"0.0.0.0"} [opt.host] - The host parameter for the server.
   * @param {number} [opt.port] - The port for the server to listen on
   * @param {bool} [opt.production] - Production mode true/false (defaults to value of NODE_ENV)
   * @param {bool|number|string} [opt.trustProxy=false] - Allow proxyed requests. See express 4.* docs for details
   */
  constructor(opt) {
    const options = OptionsSchema.validate(opt, { stripUnknown: true });
    if (options.error) throw new Error(options.error);
    this.production = options.value.production;
    this.host = options.value.host;
    this.port = options.value.port;
    this.expressApp = express();
    this.httpServer = new HttpServer(this.expressApp);
    this.io = null;
    if (this.production) {
      this.expressApp.disable('debug');
    } else {
      this.expressApp.enable('debug');
    }
    this.expressApp.disable('x-powered-by');
    this.expressApp.set('trust proxy', options.value.trustProxy);
    this.expressApp.use((req, res, next) => {
      res.arbol = new ArbolResponder(req, res);
      next();
    });
  }
  /**
   * Enable helmet security features
   * @param {helmet.IHelmetConfiguration} opt
   */
  enableHelmetSecurity(opt) {
    try {
      const helmet = require('helmet');
      this.expressApp.use(helmet(opt));
    } catch (err) {
      throw errors.missingDependency('helmet');
    }
    return this;
  }
  /**
   * Enable inbound json parsing
   * @param {string} maxPayload - The maximum size allowed in a post (1kb 1mb, etc.)
   */
  enableJsonParsing(maxPayload) {
    this.expressApp.use(express.json({ limit: maxPayload }));
    return this;
  }
  /**
   * Enable inbound url encoded payloads (forms) parsing
   * @param {string} maxPayload - The maximum size allowed in a post (1kb 1mb, etc.)
   */
  enableUrlEncodedParsing(maxPayload) {
    this.expressApp.use(express.urlencoded({ limit: maxPayload }));
    return this;
  }
  /**
   * Enable cross origin requests using the cors package
   */
  enableCORs() {
    try {
      const cors = require('cors');
      this.expressApp.use(cors());
    } catch (err) {
      throw errors.missingDependency('cors');
    }
    return this;
  }
  /**
   * Enable a custom x-powered-by header. This is usually just for some fun flair.
   * @param {string} headerValue
   */
  enableCustomXPoweredByHEader(headerValue) {
    this.expressApp.use((req, res, next) => {
      res.setHeader('x-powered-by', headerValue);
      next();
    });
    return this;
  }

  /**
   * Assign a unique identifier to each request using the uuid packaged.
   */
  enableUUIDForEachRequest() {
    try {
      const { v4 } = require('uuid');
      this.expressApp.use((req, res, next) => {
        req.uuid = v4();
        next();
      });
    } catch (err) {
      throw errors.missingDependency('uuid');
    }
    return this;
  }
  enableSocketIOServer(connectHandler) {
    try {
      this.io = require('socket.io')(this.httpServer);
      if (connectHandler) this.io.on('connect', connectHandler);
    } catch (err) {
      throw errors.missingDependency('socket.io');
    }
    return this;
  }
  addBranch(...branches) {
    branches.forEach((branch) => {
      if (branch.path) this.expressApp.use(branch.path, branch.router);
      else this.expressApp.use(branch.router);
    });
    return this;
  }
  /**
   * Start the server. Callback gets executed when the server has started.
   * @param {void} startupCallback
   */
  start(startupCallback) {
    this.httpServer.listen(this.port, this.host, startupCallback);
    return this;
  }
  /**
   * Stop the server. Callback gets executed when the server stops and may include an error as
   * the first parameter
   * @param {void} stopCallback
   */
  stop(stopCallback) {
    this.httpServer.close(stopCallback);
    return this;
  }
}

module.exports = Tree;
