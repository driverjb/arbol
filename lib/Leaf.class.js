const Joi = require('joi');

const LeafSchema = Joi.object().keys({
  method: Joi.string()
    .valid('get', 'put', 'patch', 'post', 'delete', 'all')
    .default('get')
    .optional(),
  responseType: Joi.string().valid('json', 'csv').default('json'),
  fileName: Joi.string().optional(),
  service: Joi.func().required(),
  path: Joi.string().default('/'),
  twigs: Joi.array().items(Joi.func()).optional()
});

class Leaf {
  /**
   * @class Leaf
   * @constructor
   * @param {object} opt
   * @param {"get"|"put"|"patch"|"post"|"delete"} [opt.method] The method the leaf will respond to
   * @param {string} [opt.path]
   * @param {import('./Service.class').ServiceCall} opt.service A function that receives the ArbolRequest object and returns a result or the promise of a result
   * @param {"json"|"csv"} [opt.responseType=json] The type of response to send to the client
   * @param {string} [opt.fileName] The name to use for the csv file. Only used if responseType is csv.
   * @param {function[]} [opt.twigs] A collection of express middlewares that must be executed in order before reaching the leaf responder
   */
  constructor(opt) {
    let options = LeafSchema.validate(opt, { stripUnknown: true });
    if (options.error) throw new Error(options.error);
    this.method = options.value.method;
    this.path = options.value.path;
    this.twigs = options.value.twigs || [];
    this.responder = async (req, res, error) => {
      try {
        req.arbol.data = { ...req.params, ...req.query, ...req.headers, ...req.body };
        let result = options.value.service(req.arbol);
        if (result instanceof Promise) result = await result;
        if (opt.responseType === 'csv') res.arbol.csv(result, fileName);
        else res.arbol.json(result);
      } catch (err) {
        error(err);
      }
    };
  }
  /**
   * Apply validation rules to the header fields of all requests to this branch
   * @param {import('joi').ObjectSchema} schema
   */
  validateHeader(schema) {
    this.twigs.push(validators.header(schema));
    return this;
  }
  /**
   * Apply validation rules to the url param fields of all requests to this branch
   * @param {import('joi').ObjectSchema} schema
   */
  validateParams(schema) {
    this.twigs.push(validators.params(schema));
    return this;
  }
  /**
   * Apply validation rules to the query fields of all requests to this branch
   * @param {import('joi').ObjectSchema} schema
   */
  validateQuery(schema) {
    this.twigs.push(validators.query(schema));
    return this;
  }
  /**
   * Apply validation rules to the body fields of all requests to this branch
   * @param {import('joi').ObjectSchema} schema
   */
  validateBody(schema) {
    this.twigs.push(validators.body(schema));
    return this;
  }
}

module.exports = Leaf;
