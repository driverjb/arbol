const express = require('express');
const http = require('http');
const uuid = require('uuid');
const Responder = require('./Responder.class');

class Tree {
  /**
   * Create an instance of an Arbol server
   * @param {object} config
   * @param {"0.0.0.0"|"localhost"} [config.host]
   * @param {number} [config.port]
   * @param {number|boolean} [config.trustProxy]
   * @param {string} [config.poweredBy]
   */
  constructor(config = {}) {
    /** @private */
    this.host = config.host ?? '0.0.0.0';
    /** @private */
    this.port = config.port ?? 3000;
    /** @private */
    this.trustProxy = config.trustProxy ?? false;
    /** @private */
    this.poweredBy = config.poweredBy ?? 'Arbol';
    /** @private */
    this.app = express();
    /** @private */
    this.server = http.createServer(this.app);
    /** @private */
    this.io = null;
    this.loadMiddleware();
  }
  /** @type {express.Application} */
  get expressApp() {
    return this.app;
  }
  /** @private */
  loadMiddleware() {
    this.app.use((req, res, next) => {
      //set user field to null so it's always there
      req.user = null;
      //set uuid to a unique identifier
      req.uuid = uuid.v4();
      //attach the custom responder
      res.arbol = new Responder(req.uuid, res);
      next();
    });
  }
  addExpressMiddleware(middleware) {
    this.app.use(middleware);
    return this;
  }
  /**
   * Enable json parsing
   * @param {string} limit
   */
  enableJson(limit = '1mb') {
    this.app.use(express.json({ limit }));
    return this;
  }
  enableUrlEncoded(limit = '1mb', extended = true) {
    this.app.use(express.urlencoded({ limit, extended }));
    return this;
  }
  /**
   * Attach a socket.io server
   * @param {import('socket.io').Server} socketServer
   * @param {boolean} serveClientSoftware Whether or not you want your express app to serve the socket.io client software
   * @returns {import('socket.io').Server}
   */
  enableSocketIo(serveClientSoftware = false) {
    const SocketServer = require('socket.io').Server;
    this.io = new SocketServer(this.server, { serveClient: serveClientSoftware });
    return this.io;
  }
  enableCookieParser() {
    this.app.use(require('cookie-parser')());
  }
  /**
   * Start the server
   * @param {()=>void} callback Function to call once the server has started
   */
  start(callback) {
    this.server.listen(this.port, this.host, callback);
  }
  /**
   * Stop the server
   * @param {(Error)=>void} callback
   */
  stop(callback) {
    this.server.close(callback);
  }
  /**
   * Attach a branch to the server
   * @param {import('./Branch.class')} branch
   */
  addBranch(branch) {
    this.app.use(branch.path, branch.router);
    return this;
  }
}

module.exports = Tree;
