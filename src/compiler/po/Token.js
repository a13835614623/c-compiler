/**
 * @description Token构造函数
 * @param {String} type token类型
 * @param {String} description token描述
 * @param {String} word token对应的非终结符
 */
function Token(type, description = type, word = description) {
  this.type = type;
  this.description = description;
  this.word = word;
  this.toString = () => {
    return `<${this.word},${this.description}>`;
  };
  this.equals = token => {
    if (!token || !(token instanceof Token)) return false;
    return this.word == token.word;
  };
  this.code = "";
  this.addr = "";
  this.clone=()=>{
    let token = new Token(this.type,this.description,this.word);
    token.code=this.code;
    token.addr=this.addr;
    return token;
  }
}
// module.exports = Token;
export default Token;
