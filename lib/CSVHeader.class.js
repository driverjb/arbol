class CSVHeader {
  constructor(key, title) {
    /**
     * The key that will be used to get data from the object
     * @type {string}
     * @readonly
     */
    this.key = key;
    /**
     * The title that will be used for the header
     * @type {string}
     * @readonly
     */
    this.title = title;
  }
}

module.exports = CSVHeader;
