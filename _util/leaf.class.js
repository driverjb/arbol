const Joi = require('joi');

const LeafSchema = Joi.object().keys({
  method: Joi.string()
    .valid('get', 'put', 'patch', 'post', 'delete', 'all')
    .default('get')
    .optional(),
  responder: Joi.func().required(),
  path: Joi.string().default('/'),
  twigs: Joi.array().items(Joi.func()).optional()
});

class Leaf {
  /**
   * A leaf represents an end point to a request. The responder will respond to the user directly.
   * @class Leaf
   * @constructor
   * @param {Object} opt
   * @param {"get"|"put"|"patch"|"post"|"delete"} [opt.method] The method the leaf will respond to
   * @param {string} opt.path
   * @param {function} opt.responder A responder function in the format of an express responder (req, res, [error]) => void
   * @param {function[]} [opt.twigs] A collection of express middlewares that must be executed in order before reaching the leaf responder
   */
  constructor(opt) {
    let options = LeafSchema.validate(opt, { stripUnknown: true });
    if (options.error) throw new Error(options.error);
    this.method = options.value.method;
    this.path = options.value.path;
    this.responder = options.value.responder;
    this.twigs = options.value.twigs;
  }
}

module.exports = Leaf;
