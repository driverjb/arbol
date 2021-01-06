const defaults = {
  name: 'Error',
  code: 500
};

/**
 * @typedef {object} ErrorDetails
 * @property {string} [name]
 * @property {string} message
 * @property {number} [code]
 */

class ArbolError {
  /**
   * Create an ArbolError
   * @param {ErrorDetails|Error|string} opt
   * @param {string} [opt.name]
   * @param {string} opt.message
   * @param {number} [opt.code]
   */
  constructor(opt) {
    this.name = defaults.name;
    this.code = defaults.code;
    if (typeof opt == 'string') this.message = opt;
    else if (opt instanceof Error) {
      this.name = opt.name;
      this.message = opt.message;
    } else {
      if (opt.name) this.name = opt.name;
      if (opt.code) this.code = opt.code;
      this.message = opt.message;
    }
  }
}

module.exports = ArbolError;
