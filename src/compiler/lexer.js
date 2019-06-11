import { KEYWORDS, TOKEN_TYPE } from "./constant";
import Token from "./po/Token";
import {
  isLetter,
  isDigit,
  isBitOrRelationOperator,
  isDelimiters,
  isBlank,
  isAssignment,
  isMathOperator,
  isLogicOperator,
  isTernaryOperator
} from "./base";
/**
 * 本文件是一个C语言词法解析器
 */
//symbols 符号表
var symbols = [];
// 行号
var line = -1;
// 源代码
var source = "";
// 当前字符索引
var index = -1;
// 当前字符
var c = "";
/**
 * Lexer构造器
 * @constructor
 * @param {String} code 源代码
 * @return {Lexer} 词法分析器对象
 */
function Lexer(code = "") {
  // 预处理
  // code = preprocessor(code);
  source = code;
  index = -1;
  line = -1;
  c = "";
  this.symbols = symbols = [];
}
/**
 * 移动并返回下一个字符
 * @returns {String} 下一个字符
 */
function next() {
  return (c = source.charAt(++index));
}
/**
 * 返回下一个字符，不移动
 * @returns {String} 上一个字符
 */
function getNext() {
  return source.charAt(index + 1);
}
/**
 * 移动并返回上一个字符
 * @returns {String} 上一个字符
 */
function back() {
  return (c = source.charAt(--index));
}
/**
 * 返回上一个字符，不移动
 * @returns {String} 上一个字符
 */
function getLast() {
  return source.charAt(index - 1);
}
/**
 * 添加用户自定义标识符到符号表
 * @param {String} id 用户自定义标识符
 * @returns {Number}符号表的索引
 */
function installID(id) {
  let index = symbols.indexOf(id);
  // 如果符号表中
  if (index == -1) {
    // 不存在该标识符,则添加，返回新添加的索引
    return symbols.push(id) - 1;
  } else {
    //存在，返回在符号表中的索引
    return index;
  }
}
/**
 * 获取数字Token
 * @returns {Token} token对象
 */
function getNum() {
  let word = "";
  let state = 0;
  while (true) {
    switch (state) {
      case 0:
        if (isDigit(c)) state = 1;
        else return null;
        break;
      case 1:
        if (c == ".") state = 2;
        else if (c == "e") state = 5;
        else if (isDigit(c)) state = 1;
        else state = 9;
        break;
      case 2:
        if (isDigit(c)) state = 3;
        else return null;
        break;
      case 3:
        if (c == "e") state = 5;
        else if (isDigit(c)) state = 3;
        else state = 4;
        break;
      case 5:
        if (c == "-" || c == "+") state = 6;
        else if (isDigit(c)) state = 7;
        else return null;
        break;
      case 6:
        if (isDigit(c)) state = 7;
        else return null;
        break;
      case 7:
        if (isDigit(c)) state = 7;
        else state = 8;
        break;
      case 4: //小数
      case 8: //科学计数法
      case 9: //整数
        back();
        return new Token(TOKEN_TYPE.NUMBER, word, "num");
      default:
        throw new Error("词法错误,非法token:" + word);
    }
    if ([4, 8, 9].indexOf(state) == -1) {
      word += c;
      c = next();
    }
  }
}
/**
 * 获取关键字或用户自定义标识符token
 * @returns {Token} token对象
 */
function getWord() {
  let word = "";
  if (!isLetter(c)) return;
  while (isLetter(c) || isDigit(c)) {
    word += c;
    next();
  }
  back();
  // 如果是关键字或者保留字，则返回
  if (KEYWORDS.indexOf(word) != -1) {
    return new Token(word, word, word == "main" ? "id" : word);
  } else {
    //否则
    // 添加用户自定义标识符到符号表,返回为id类型的用户自定义标识符
    return new Token(TOKEN_TYPE.ID, installID(word), "id");
  }
}
/**
 * 获取位运算符或关系运算符的token
 * @returns {Token} token对象
 */
function getBitOrRelationOperator() {
  // 终态集
  let stateMap = {
    2: "LE", //<=
    3: "LEFT_SHIFT", //<<
    4: "LT", //<
    6: "GE", //>=
    7: "RIGHT_SHIFT", //>>
    8: "GT", //>
    10: "EQ", //==
    12: "NE", //!=
    13: "BIT_REVERSE" //~
  };
  let charMap = {
    2: "<=", //
    3: "<<", //
    4: "<", //
    6: ">=", //>=
    7: ">>", //>>
    8: ">", //>
    10: "==", //==
    12: "!=", //!=
    13: "~" //~
  };
  let state = 0;
  let startMap = {
    "<": 1,
    ">": 5,
    "=": 9,
    "!": 11
  };
  while (c) {
    switch (state) {
      case 0:
        state = startMap[c];
        next();
        break;
      case 1:
        if (c == "=") state = 2;
        else if (c == "<") state = 3;
        else if (c == "~") state = 13;
        else {
          back();
          state = 4;
        }
        break;
      case 5:
        if (c == "=") state = 6;
        else if (c == ">") state = 7;
        else {
          back();
          state = 8;
        }
        break;
      case 9:
        if (c == "=") state = 10;
        else {
          back();
          state = 11;
        }
        break;
      case 11:
        if (c == "=") state = 12;
        else return null;
        break;
      case 3:
      case 13:
      case 7: //位运算符
        return new Token(
          TOKEN_TYPE.BIT_OPERATOR,
          stateMap[state],
          charMap[state]
        );
      case 2: //关系运算符
      case 4:
      case 6:
      case 8:
      case 10:
      case 12:
        //关系运算符
        return new Token(
          TOKEN_TYPE.RELATION_OPERATOR,
          stateMap[state],
          charMap[state]
        );
    }
  }
}
/**
 * 获取算术运算符token
 * @returns {Token} token对象
 */
function getMathOperator() {
  if (!isMathOperator(c)) return;
  if (c == getNext() && (c == "+" || c == "-")) {
    next();
    if (c == "+")
      return new Token(TOKEN_TYPE.MATH_OPERATOR, "AUTO_INCREAMENT", "++");
    else return new Token(TOKEN_TYPE.MATH_OPERATOR, "AUTO_DECREMENT", "--");
  } else {
    let map = { "+": "ADD", "-": "SUB", "*": "MUL", "/": "SUB", "%": "MOD" };
    return new Token(TOKEN_TYPE.MATH_OPERATOR, map[c], c);
  }
}
/**
 * 获取逻辑运算符token
 * @returns {Token} token对象
 */
function getLogicOperator() {
  let state = 0;
  let stateMap = {
    2: "LOGIC_AND",
    3: "BIT_AND",
    5: "LOGIC_OR",
    6: "BIT_OR",
    7: "BIT_XOR",
    8: "LOGIC_NON"
  };
  let wordMap = {
    2: "&&",
    3: "&",
    5: "||",
    6: "|",
    7: "^",
    8: "!"
  };
  while (c) {
    switch (state) {
      case 0:
        if (c == "&") {
          state = 1;
          next();
        } else if (c == "|") {
          state = 4;
          next();
        } else if (c == "^") {
          state = 7;
        } else if (c == "!") {
          state = 8;
        } else {
          return null;
        }
        break;
      case 1:
        if (c == "&") {
          state = 2;
        } else {
          back();
          state = 3;
        }
        break;
      case 4:
        if (c == "|") {
          state = 5;
        } else {
          back();
          state = 6;
        }
        break;
      case 2:
      case 3:
      case 5:
      case 6:
      case 7:
      case 8:
        return new Token(
          TOKEN_TYPE.LOGIC_OPERATOR,
          stateMap[state],
          wordMap[state]
        );
    }
  }
}
/**
 * 移动并获取下一个token
 * @returns {Token} token对象
 */
function nextToken() {
  let state = 0;
  let token = 0;
  next();
  while (c) {
    switch (state) {
      case 0: //初始状态
        token = -1;
        while (isBlank(c)) {
          //如果是空白符
          c = next();
        }
        if (isDigit(c)) state = 1;
        else if (isLetter(c)) state = 2;
        else if (c == ";") state = 3;
        else if (c == ",") state = 4;
        else if (isTernaryOperator(c)) state = 5;
        else if (isDelimiters(c)) state = 6;
        else if (isMathOperator(c)) state = 7;
        else if (isLogicOperator(c, getNext())) state = 8;
        else if (isAssignment(c, getNext())) state = 9;
        else if (isBitOrRelationOperator(c) || c == "=") state = 10;
        else state = -1; //词法错误
        break;
      case 1: //数字
        token = getNum();
        break;
      case 2: //字母
        token = getWord();
        break;
      case 3: //分号
        return new Token(TOKEN_TYPE.SECMICOLON, c);
      case 4: //逗号
        return new Token(TOKEN_TYPE.COMMA, c);
      case 5: //三目运算符
        return new Token(TOKEN_TYPE.TERNARY_OPERATOR, c);
      case 6: // 分隔符
        return new Token(TOKEN_TYPE.DELIMITER, c);
      case 7: // 算术运算符
        token = getMathOperator();
        break;
      case 8: // 逻辑运算符
        token = getLogicOperator();
        break;
      case 9: // 赋值符
        token = new Token(TOKEN_TYPE.ASSIGNMENT, "=");
        break;
      case 10: // 位运算符,关系运算符
        token = getBitOrRelationOperator();
        break;
      case -1:
      default:
        //词法错误
        throw new Error(`词法错误,未知的token:${c}.`);
    }
    if (token && token != -1) return token;
    if (token == null) state = -1;
  }
}
/**
 * 解析全部,返回token对象数组
 * @returns {Array<Token>} token数组
 */
function parseAll() {
  let tokens = [];
  let token;
  while ((token = nextToken())) {
    tokens.push(token);
  }
  return tokens;
}
/**
 * 解析单行,返回token对象数组
 * @returns {Array<Token>} token数组
 */
function parseSingleLine() {
  let tokens = [];
  let l = line;
  let token = nextToken();
  tokens.push(token);
  while (token && l == line) {
    tokens.push((token = nextToken()));
  }
  return tokens;
}
Lexer.prototype.nextToken = nextToken;
Lexer.prototype.line = line;
Lexer.prototype.parseAll = parseAll;
Lexer.prototype.parseSingleLine = parseSingleLine;
// module.exports = Lexer;
export default Lexer;
