/**
 * @description Token构造函数
 * @param {String} name token名
 * @param {String} description token描述
 */
function Token(name, description = name) {
  this.name = name;
  this.description = description;
}
// export default Token;
module.exports = Token;
