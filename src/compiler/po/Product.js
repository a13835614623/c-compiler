/**
 * 产生式类
 * @param {String|Token} left 产生式左部
 * @param {Array<string|Token>} right 产生式右部
 * @param {Function} rule 语义规则
 */
function Product(left, right, rule = product => {}) {
  this.left = left;
  this.right = right;
  this.rule = rule;
  this.item = 0;
  this.toString = () => {
    let str = this.left.word + " --> ",length=this.right.length;
    for (let i = 0; i < length; i++) {
      if (i == this.item) str += ".";
      str += this.right[i].word + " ";
    }
    if(this.item==length)str+=".";
    return str;
  };
  this.t="";
  this.equals = product => {
    return this.toString() == product.toString() && this.item == product.item;
  };
  this.clone = () => {
    let p = new Product(this.left.clone(), this.right.map(r=>{
      return r.clone();
    }), this.rule);
    p.item = this.item;
    p.t=this.t;
    return p;
  };
}
// module.exports = Product;
export default Product;
