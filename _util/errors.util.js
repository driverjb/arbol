/**
 * Error for when an enabled dependency is missing
 * @param {string} name
 */
module.exports.missingDependency = function (name) {
  let e = new Error(`Attempted to enable ${name}. Please install ${name} using npm.`);
  e.name = 'MissingDependency';
  return e;
};
