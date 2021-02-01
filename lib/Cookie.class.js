class Cookie {
  /**
   *
   * @param {object} opt
   * @param {string} opt.name
   * @param {object} opt.content
   * @param {string} [opt.redirectAfter]
   * @param {import('express').CookieOptions} opt.options
   */
  constructor(opt) {
    this.name = opt.name;
    this.content = opt.content;
    this.options = opt.options;
    this.redirectAfter = opt.redirectAfter ?? null;
    if (!(typeof this.content == 'string')) JSON.stringify(this.content);
  }
}
module.exports = Cookie;
