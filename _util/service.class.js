const { EventEmitter } = require('events');

class Service extends EventEmitter {
  constructor() {
    super();
    /** @private */
    this.services = {};
  }
}
