class NoEnvelope {
  /**
   * Use this when you need to return data from an api call without the standard arbol envelope
   * @param {*} data
   */
  constructor(data) {
    Object.assign(this, data);
  }
}

module.exports = NoEnvelope;
