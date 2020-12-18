const ArbolError = require('./ArbolError.class');

class ArbolResponse {
  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  constructor(req, res) {
    this.req = req;
    this.res = res;
  }
  /**
   * Respond to the request with a formatted JSON payload
   * @param {*} data
   */
  json(data) {
    let result = {
      uuid: this.req.arbol.uuid,
      data: data,
      error: null
    };
    if (data instanceof ArbolError) {
      result.error = data;
      result.data = null;
    } else if (data instanceof Error) {
      result.error = new ArbolError({ message: data.message, name: data.name });
      result.data = null;
    }
    if (result.error) this.res.status(result.error.code).json(result);
    else this.res.status(200).json(result);
  }
  /**
   * Respond to the request in CSV format
   * @param {string[]|string} csvData
   * @param {string} [fileName=download]
   */
  csv(csvData, fileName) {
    if (!fileName) fileName = 'download';
    this.res.setHeader('Content-Type', 'text/csv');
    this.res.setHeader('Content-Disposition', `attachment; filename=${fileName}.csv`);
    this.res.setHeader('Pragma', 'no-cache');
    this.res.setHeader('Expires', '0');
    this.res.status(200).send(Array.isArray(csvData) ? csvData.join('\n') : csvData);
  }
}

module.exports = ArbolResponse;
