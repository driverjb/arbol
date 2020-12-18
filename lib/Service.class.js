const { EventEmitter } = require('events');
const ArbolRequest = require('./ArbolRequest.class');

/**
 * Services contain functions that should all adhere to this standard
 * @callback ServiceCall
 * @param {ArbolRequest} request
 * @returns {any|Promise<any>}
 */

class Service extends EventEmitter {
  /**
   * @class Service
   * @constructor
   */
  constructor() {
    super();
  }
}

module.exports = Service;
