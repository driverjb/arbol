const ArbolError = require('./arbolError.class');

class ArbolResponder {
  constructor(req, res) {
    this.req = req;
    this.res = res;
  }
  json(data) {
    let result = {
      uuid: this.req.uuid,
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
  csv(csvData, fileName) {
    this.res.setHeader('Content-Type', 'text/csv');
    this.res.setHeader('Content-Disposition', `attachment; filename=${fileName}.csv`);
    this.res.setHeader('Pragma', 'no-cache');
    this.res.setHeader('Expires', '0');
    this.res.status(200).send(Array.isArray(csvData) ? csvData.join('\n') : csvData);
  }
}

module.exports = ArbolResponder;
