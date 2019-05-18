/**
 * 产生式类
 * @param {String} left 产生式左部
 * @param {Array<string>} right 产生式右部
 */
function Product(left, right) {
  this.left = left;
  this.right = right;
  this.toString =
    this.left +
    "---->" +
    this.right.reduce((pre, cur) => {
      return pre + " " + cur;
    });
}
// export default Product;
module.exports = Product;
