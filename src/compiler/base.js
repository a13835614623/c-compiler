import {
  DELIMITERS,
  TERNARY_OPERATORS,
  MATH_OPERATORS,
  LOGIC_OPERATORS,
  BIT_RELATION_OPERATORS
} from "./constant";
/**
 * 是否是字母（包括下划线_）
 * @param {String} c 输入字符
 * @returns {Boolean}
 */
function isLetter(c) {
  return (c >= "a" && c <= "z") || (c >= "A" && c <= "Z") || c == "_";
}
/**
 * 是否是数字
 * @param {*} c 输入字符
 */
function isDigit(c) {
  let regex = new RegExp("[0-9]");
  return regex.test(c);
}
/**
 * 是否是运算符或者关系运算符
 * @param {*} c 输入字符
 * @returns {Boolean}
 */
function isBitOrRelationOperator(c) {
  return BIT_RELATION_OPERATORS.indexOf(c) != -1;
}
/**
 * 是否是分隔符
 * @param {*} c 输入字符
 * @returns {Boolean}
 */
function isDelimiters(c) {
  return DELIMITERS.indexOf(c) != -1;
}
/**
 * 是否是空白字符
 * @param {*} c 字符
 * @returns {Boolean}
 */
function isBlank(c) {
  let regex = new RegExp("\\s");
  return regex.test(c);
}
/**
 * 是否是算术运算符
 * @param {*} c 输入字符
 * @returns {Boolean}
 */
function isMathOperator(c) {
  return MATH_OPERATORS.indexOf(c) != -1;
}
/**
 * 是否是逻辑运算符
 * @param {*} c 输入字符
 * @returns {Boolean}
 */
function isLogicOperator(c, next) {
  //下一个不能为等号，防止和!=冲突
  return LOGIC_OPERATORS.indexOf(c) != -1 && next != "=";
}
/**
 * 是否是三目运算符
 * @param {*} c 输入字符
 * @returns {Boolean}
 */
function isTernaryOperator(c) {
  return TERNARY_OPERATORS.indexOf(c) != -1;
}
/**
 * 判断是否为赋值符
 * @param {String} c 当前字符
 * @param {String} next 下一个字符
 * @returns {Boolean}
 */
function isAssignment(c, next) {
  return c == "=" && next != "=";
}
export {
  isLetter,
  isDigit,
  isBitOrRelationOperator,
  isDelimiters,
  isBlank,
  isMathOperator,
  isLogicOperator,
  isTernaryOperator,
  isAssignment
};
