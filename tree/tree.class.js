const express = require('express');
const { Server } = require('http');
const { runInThisContext } = require('vm');
const HttpServer = require('http').Server;
const OptionsSchema = require('./tree.schema');

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
  constructor(opt = {}) {
    const options = OptionsSchema.validate(opt, { stripUnknown: true });
    if (options.error) throw new Error(options.error);
    this.production = options.value.production;
    this.host = options.value.host;
    this.port = options.value.port;
    this.expressApp = express();
    this.httpServer = new HttpServer(this.expressApp);
    if (this.production) {
      this.expressApp.disable('debug');
    } else {
      this.expressApp.enable('debug');
    }
    this.expressApp.set('trust proxy', options.value.trustProxy);
  }
  /**
   * Enable helmet security features
   * @param {helmet.IHelmetConfiguration} opt
   */
  enableHelmetSecurity(opt) {
    const helmet = require('helmet');
    this.expressApp.use(helmet(opt));
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
  enableCORs() {
    const cors = require('cors');
    this.expressApp.use(cors());
    return this;
  }
}

module.exports = Tree;
