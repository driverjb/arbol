const ArbolError = require('./ArbolError.class');

module.exports = {
  unauthorized: new ArbolError({
    message: 'A valid user token is required',
    name: 'Unauthorized',
    code: 401
  }),
  forbidden: new ArbolError({
    message: 'User missing required permission',
    name: 'Forbidden',
    code: 403
  })
};
