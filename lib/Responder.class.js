const ArbolError = require('./ArbolError.class');

/**
 * Convert an array of objects into CSV format
 * @param {object[]} a
 * @param {string} [delimiter]
 * @return {string}
 */
function jsonToCsv(a, delimiter = ',') {
  let result = [];
  if (a.length > 0) {
    let header = [];
    for (let k in a[0]) header.push(k);
    result.push(header.join(delimiter));
    for (let i = 0; i < a.length; i++) {
      let row = [];
      for (let k in a[i]) row.push(a[i][k]);
      result.push(row.join(delimiter));
    }
  }
  return result.join('\n');
}

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
  /**
   * Respond to a request with json
   * @param {*} data
   */
  json = (data) => {
    if (data instanceof Error) {
      let ae = new ArbolError(data);
      this.res.status(ae.code).json({ uuid: this.uuid, data: null, error: ae });
    } else if (data instanceof ArbolError) {
      this.res.status(data.code).json({ uuid: this.uuid, data: null, error: data });
    } else {
      this.res.status(200).json({ uuid: this.uuid, data, error: null });
    }
  };
  /**
   * Respond to a request in CSV format
   * @param {object[]} data
   * @param {string} fileName
   * @param {string} delimiter
   */
  csv = (data, fileName = 'data.csv', delimiter = ',') => {
    if (!fileName.includes('.csv')) fileName += '.csv';
    this.res.setHeader('Content-Type', 'text/csv');
    if (data instanceof Error || data instanceof ArbolError) {
      this.res.setHeader(
        'Content-Disposition',
        `attachment; filename="${fileName.replace('.csv', '-error.txt')}"`
      );
      this.res.status(500).send(data.message);
    } else {
      this.res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      this.res.status(200).send(jsonToCsv(data, delimiter));
    }
  };
}

module.exports = Responder;
