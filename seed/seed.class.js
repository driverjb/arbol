const express = require('express');
const { Server } = require('http');
const HttpServer = require('http').Server;

class Seed {
  /**
   * @class Seed - This is the foundation of an arbol project. All trees begin with a seed. The Seed instance houses
   * the http server, express server, and other foundational parts of the web service.
   * @param {Object} opt - Options for starting up a Seed
   * @param {"localhost"|"0.0.0.0"} [opt.host] - The host parameter for the server.
   * @param {number} [opt.port] - The port for the server to listen on
   * @param {bool} [opt.production] - Production mode true/false (defaults to value of NODE_ENV)
   * @param {bool|number|string} [opt.trustProxy=false] - Allow proxyed requests. See express 4.* docs for details
   */
  constructor(opt) {
    this.production =
      opt.production === undefined ? process.env.NODE_ENV === 'production' : opt.production;
    this.host = opt.host || '0.0.0.0';
    this.port = opt.port || 3000;
    this.expressApp = express();
    this.httpServer = new HttpServer(this.expressApp);
    let trustProxy = opt.trustProxy === undefined ? false : opt.trustProxy;
    if (prd) {
      this.expressApp.disable('debug');
    } else {
      this.expressApp.enable('debug');
    }
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
}

module.exports = Seed;
