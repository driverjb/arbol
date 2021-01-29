const CSVFile = require('./CSVFile.class');
const Cookie = require('./Cookie.class');
const ArbolError = require('./ArbolError.class');
const NoEnvelope = require('./NoEnvelope.class');

class Responder {
  /**
   *
   * @param {string} uuid
   * @param {import('express').Response} res
   */
  constructor(uuid, res) {
    this.uuid = uuid;
    this.res = res;
  }
  respond = (data) => {
    if (data instanceof Error) {
      let ae = new ArbolError(data);
      this.res.status(ae.code).json({ uuid: this.uuid, data: null, error: ae });
    } else if (data instanceof ArbolError) {
      this.res.status(data.code).json({ uuid: this.uuid, data: null, error: data });
    } else if (data instanceof CSVFile) {
      this.res.setHeader('Content-Type', 'text/csv');
      this.res.setHeader('Content-Disposition', `attachment; filename="${data.fileName}"`);
      this.res.status(200).send(data.content);
    } else if (data instanceof Cookie) {
      this.res.cookie(data.name, data.content, data.options);
      this.res.status(200).json(data.content);
    } else if (data instanceof NoEnvelope) {
      this.res.status(200).json(data);
    } else {
      this.res.status(200).json({ uuid: this.uuid, data, error: null });
    }
  };
}

module.exports = Responder;
