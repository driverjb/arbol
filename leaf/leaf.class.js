const LeafeSchema = require('./leaf.schema');
const LeafSchema = require('./leaf.schema');

class Leaf {
  /**
   * A leaf represents an end point to a request. The responder will respond to the user directly.
   * @class Leaf
   * @constructor
   * @param {Object} opt
   * @param {"get"|"put"|"patch"|"post"|"delete"} [opt.method] The method the leaf will respond to
   * @param {string} opt.path
   * @param {function} opt.responder A responder function in the format of an express responder (req, res, [error]) => void
   */
  constructor(opt) {
    let options = LeafSchema.validate(opt, { stripUnknown: true });
    if (options.error) throw new Error(options.error);
    this.method = options.value.method;
    this.path = options.value.path;
    this.responder = options.value.responder;
  }
}

module.exports = Leaf;
