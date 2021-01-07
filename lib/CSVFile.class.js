const ArbolError = require('./ArbolError.class');
const CSVHeader = require('./CSVHeader.class');

/**
 * Just use the raw keys for the headers
 * @param {object[]} data
 * @returns {CSVHeader[]}
 */
function extractHeaders(data) {
  if (data.length === 0) return [];
  else {
    let headers = [];
    let sample = data[0];
    for (let field in sample) headers.push(new CSVHeader(field, field));
    return headers;
  }
}

class CSVFile {
  /**
   * Create a CSV file response
   * @param {object} opt
   * @param {object[]} opt.data
   * @param {string} [opt.fileName]
   * @param {string} [opt.delimiter]
   * @param {CSVHeader[]} [opt.headers]
   */
  constructor(opt) {
    this.headers = opt.headers ?? extractHeaders(opt.data);
    this.delimiter = opt.delimiter ?? ',';
    this.fileName = opt.fileName ?? 'data.csv';
    if (!this.fileName.includes('.csv')) this.fileName += '.csv';
    this.content = this.prepareContent(opt.data, opt.delimiter ?? ',');
  }
  /**
   * Prepare the csv file content
   * @private
   * @param {object[]} data
   * @returns {string}
   */
  prepareContent(data) {
    if (data.length > 0) {
      let results = [];
      results.push(this.headers.map((h) => h.title).join(this.delimiter));
      for (let i = 0; i < data.length; i++) {
        let row = [];
        for (let j = 0; j < this.headers.length; j++) row.push(data[i][this.headers[j].field]);
        results.push(row.join(this.delimiter));
      }
      return results.join('\n');
    } else return '';
  }
}

module.exports = CSVFile;
