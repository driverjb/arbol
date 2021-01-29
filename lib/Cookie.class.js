class Cookie {
  /**
   *
   * @param {object} opt
   * @param {string} opt.name
   * @param {object} opt.content
   * @param {import('express').CookieOptions} opt.options
   */
  constructor(opt) {
    if (!(typeof opt == 'string')) opt.content = JSON.stringify(opt.content);
    this.name = opt.name;
    this.content = opt.content;
    this.options = opt.options;
  }
}
module.exports = Cookie;
