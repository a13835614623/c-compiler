// let Product = require("./po/Product");
// let Token = require("./po/Token");
import Product from "./po/Product";
import Token from "./po/Token";
/**
 * 本文件定义所有常量
 */
const TOKEN_TYPE = {
  ID: "id", //标识符
  NUMBER: "num", //数字
  RELATION_OPERATOR: "RELATION_OPERATOR", //关系运算符
  MATH_OPERATOR: "MATH_OPERATOR", //算术运算符
  LOGIC_OPERATOR: "LOGIC_OPERATOR", //逻辑运算符
  BIT_OPERATOR: "BIT_OPERATOR", //位运算符
  DELIMITER: "DELIMITER", // 括号分隔符
  ASSIGNMENT: "ASSIGNMENT", //赋值符
  SECMICOLON: "SECMICOLON", //分号
  COMMA: "COMMA", //逗号
  TERNARY_OPERATOR: "TERNARY_OPERATOR" //三目运算符
};
const TOKEN_TAG = {
  id: "自定义标识符", //标识符
  num: "数字", //数字
  RELATION_OPERATOR: "关系运算符", //关系运算符
  MATH_OPERATOR: "算术运算符", //算术运算符
  LOGIC_OPERATOR: "逻辑运算符", //逻辑运算符
  BIT_OPERATOR: "位运算符", //位运算符
  DELIMITER: "括号分隔符", // 括号分隔符
  ASSIGNMENT: "赋值符", //赋值符
  SECMICOLON: "分号", //分号
  COMMA: "逗号运算符", //逗号
  TERNARY_OPERATOR: "三目运算符" //三目运算符
};
// 括号分隔符
const DELIMITERS = ["{", "}", "(", ")", "[", "]"];
// 算术运算符
const MATH_OPERATORS = ["+", "-", "/", "*", "%", "++", "--"];
// 三目运算符
const TERNARY_OPERATORS = ["?", ":"];
// 逻辑运算符
const LOGIC_OPERATORS = ["&", "|", "&&", "||", "^", "!"];
// 位运算符
const BIT_OPERATORS = [">>", "<<", "~"];
// 关系运算符
const RELATION_OPERATORS = ["<", "<=", ">", ">=", "==", "!="];
// 包含逻辑运算符和位运算符,写一起是为了方便判断
const BIT_RELATION_OPERATORS = [
  "<",
  "<=",
  ">",
  ">=",
  "==",
  "!=",
  "~",
  "<<",
  ">>"
];
// 关键字和保留字
const KEYWORDS = [
  "auto",
  "break",
  "main",
  "case",
  "char",
  "const",
  "continue",
  "default",
  "do",
  "double",
  "else",
  "enum",
  "extern",
  "float",
  "for",
  "goto",
  "if",
  "int",
  "long",
  "register",
  "return",
  "short",
  "signed",
  "sizeof",
  "static",
  "struct",
  "switch",
  "typedef",
  "union",
  "unsigned",
  "void",
  "volatile",
  "while"
];

// 空
const NIL = "ε";
const EOF = "$";
/**
 * 构造一个Product对象
 * @param {String} left 产生式左部
 * @param {Array<String>} right 产生式右部
 * @param {Function} rule 语义规则
 */
function p(left, right, rule = null) {
  return new Product(
    new Token("", left),
    right.map(t => {
      return new Token("", t);
    }),
    rule
  );
}
let numT = 1,
  numL = 1;
/**
 * 生成一个新临时变量
 */
function newTemp() {
  return "t" + numT++;
}
/**
 * 生成一个新的语句标号
 */
function newLabel() {
  return "L" + numL++;
}
/**
 * 获取下一个语句标号，不自增
 */
function getLabel() {
  return "L" + numL;
}
/**
 * 获取label
 * @param {*} label
 */
function label(label) {
  return label + ": ";
}
/**
 * 二元运算符语法规则
 * @param {Product} product 产生式
 */
function doubleExpRule({ left, right }) {
  left.addr = newTemp();
  left.code = right[0].code + right[2].code;
  left.code +=
    left.addr +
    " = " +
    right[0].addr +
    " " +
    right[1].word +
    " " +
    right[2].addr +
    " ;\n";
}
/**
 * 单右部产生式语法规则
 * @param {Product} product 产生式
 */
function singleRightRule({ left, right }) {
  left.code = right[0].code;
}
//语法分析
let Products = [
  p("PROGRAM'", ["PROGRAM"], ({ left, right }) => {
    left.code = right[0].code;
  }),
  p("PROGRAM", ["METHOD", "PROGRAM"], ({ left, right }) => {
    left.code = right[0].code + right[1].code;
  }),
  p("PROGRAM", ["METHOD"], ({ left, right }) => {
    left.code = right[0].code;
  }),
  p("EXP", ["id", "=", "EXP"], ({ left, right }) => {
    left.code = right[2].code;
    left.code += right[0].addr + " = " + right[2].addr + " ;\n";
    left.addr = right[0].addr;
  }),
  p("EXP", ["EXP13"], ({ left, right }) => {
    left.code = right[0].code;
    left.addr = right[0].addr;
  }),
  p("EXP13", ["EXP13", "?", "EXP12", ":", "EXP12"], ({ left, right }) => {
    right[0].true = newLabel();
    right[0].false = newLabel();
    left.addr = newTemp();
    left.code = right[0].code;
    left.code += "if " + right[0].addr + " goto " + right[0].true + "\n";
    left.code += "goto " + right[0].false + "\n";
    left.code +=
      right[0].true + ": " + left.addr + " = " + right[2].addr + " ;\n";
    left.code +=
      right[0].false + ": " + left.addr + " = " + right[4].addr + " ;\n";
  }),
  p("EXP12", ["EXP12", "||", "EXP11"], doubleExpRule),
  p("EXP11", ["EXP11", "&&", "EXP10"], doubleExpRule),
  p("EXP10", ["EXP10", "|", "EXP9"], doubleExpRule),
  p("EXP9", ["EXP9", "^", "EXP8"], doubleExpRule),
  p("EXP8", ["EXP8", "&", "EXP7"], doubleExpRule),
  p("EXP7", ["EXP7", "==", "EXP6"], doubleExpRule),
  p("EXP7", ["EXP7", "!=", "EXP6"], doubleExpRule),
  p("EXP6", ["EXP6", "<", "EXP5"], doubleExpRule),
  p("EXP6", ["EXP6", ">", "EXP5"], doubleExpRule),
  p("EXP6", ["EXP6", "<=", "EXP5"], doubleExpRule),
  p("EXP6", ["EXP6", ">=", "EXP5"], doubleExpRule),
  p("EXP5", ["EXP5", "<<", "EXP4"], doubleExpRule),
  p("EXP5", ["EXP5", ">>", "EXP4"], doubleExpRule),
  p("EXP4", ["EXP4", "+", "EXP3"], doubleExpRule),
  p("EXP4", ["EXP4", "-", "EXP3"], doubleExpRule),
  p("EXP3", ["EXP3", "*", "EXP2"], doubleExpRule),
  p("EXP3", ["EXP3", "/", "EXP2"], doubleExpRule),
  p("EXP3", ["EXP3", "%", "EXP2"], doubleExpRule),
  p("EXP2", ["-", "EXP1"], ({ left, right }) => {
    left.addr = newTemp();
    left.code = left.addr + " = " + right[0].word + " " + right[1].addr + " ;";
  }),
  p("EXP2", ["--", "EXP2"], ({ left, right }) => {
    left.addr = newTemp();
    left.code = right[1].addr + " = " + right[1].addr + "- 1 ;";
    left.code = left.addr + " = " + right[1].addr;
  }),
  p("EXP2", ["++", "EXP2"], ({ left, right }) => {
    left.addr = newTemp();
    left.code = right[1].addr + " = " + right[1].addr + "+ 1 ;";
    left.code = left.addr + " = " + right[1].addr;
  }),
  p("EXP2", ["!", "EXP2"], ({ left, right }) => {
    left.addr = newTemp();
    left.code =
      left.addr + " = " + right[0].word + " " + right[1].addr + " ;\n";
  }),
  p("EXP2", ["~", "EXP2"], ({ left, right }) => {
    left.addr = newTemp();
    left.code =
      left.addr + " = " + right[0].word + " " + right[1].addr + " ;\n";
  }),
  p("EXP2", ["EXP2", "++"], ({ left, right }) => {
    left.addr = newTemp();
    left.code = left.addr + " = " + right[0].addr;
    left.code = right[0].addr + " = " + right[0].addr + " + 1 ;\n";
  }),
  p("EXP2", ["EXP2", "--"], ({ left, right }) => {
    left.addr = newTemp();
    left.code = left.addr + " = " + right[0].addr;
    left.code = right[0].addr + " = " + right[0].addr + " - 1 ;\n";
  }),
  p("EXP2", ["sizeof", "EXP2"], ({ left, right }) => {
    left.addr = newTemp();
    left.code = left.addr + " = " + right[1].length + " ";
  }),
  p("EXP1", ["(", "EXP", ")"], ({ left, right }) => {
    left.addr = right[1].addr;
    left.code = right[1].code;
  }),
  p("EXP1", ["num"], ({ left, right }) => {
    left.addr = right[0].addr;
  }),
  p("EXP1", ["id"], ({ left, right }) => {
    left.addr = right[0].addr;
  }),
  p("EXP1", ["METHOD_INVOKE"], ({ left, right }) => {
    left.addr = newTemp();
    left.code = right[0].code;
    left.code += left.addr + " = " + right[0].addr + " ;";
  }),
  // 方法调用
  p("METHOD_INVOKE", ["id", "(", ")"]),
  p("METHOD_INVOKE", ["id", "(", "EXP_LIST", ")"]),
  p("EXP_LIST", ["EXP", ",", "EXP"]),
  p("EXP_LIST", ["EXP"]),
  p("BASE_BLOCK", ["CODE_BLOCK"], ({ left, right }) => {
    left.code = right[0].code;
  }),
  p("BASE_BLOCK", ["STMT"], ({ left, right }) => {
    left.code = right[0].code;
  }),
  p("CODE_BLOCK", ["{", "STMTS", "}"], ({ left, right }) => {
    left.code = right[1].code;
  }), //代码块
  p("CODE_BLOCK", ["{", "}"], ({ left, right }) => {
    left.code = "";
  }), //代码块
  p("STMTS", ["STMT", "STMTS"], ({ left, right }) => {
    left.code = right[0].code + right[1].code;
  }), //多条语句
  p("STMTS", ["STMT"], ({ left, right }) => {
    left.code = right[0].code;
  }), //多条语句
  p("STMT", ["ASSIGN_STMT"], singleRightRule), //赋值语句
  p("STMT", ["METHOD_INVOKE_STMT"], singleRightRule), //方法调用语句
  p("STMT", ["ID_DECLARE_STMT"], singleRightRule), //变量声明语句
  p("STMT", ["IF_STMT"], singleRightRule), //if语句
  p("STMT", ["IF_ELSE_STMT"], singleRightRule), //if-else语句
  p("STMT", ["WHILE_STMT"], singleRightRule), //while语句
  p("STMT", ["DO_WHILE_STMT"], singleRightRule), //do-while语句
  p("STMT", ["FOR_STMT"], singleRightRule), //for语句
  p("STMT", ["SWITCH_STMT", singleRightRule]), //switch语句
  p("STMT", ["RETURN_STMT", singleRightRule]), //return语句
  p("STMT", [";"], singleRightRule), //空语句
  // 基本数据类型
  p("ID_TYPE", ["short"], ({ left, right }) => {
    left.type = "short";
    left.width = 2;
  }),
  p("ID_TYPE", ["char"], ({ left, right }) => {
    left.type = "char";
    left.width = 2;
  }),
  p("ID_TYPE", ["int"], ({ left, right }) => {
    left.type = "int";
    left.width = 4;
  }),
  p("ID_TYPE", ["float"], ({ left, right }) => {
    left.type = "float";
    left.width = 4;
  }),
  p("ID_TYPE", ["long"], ({ left, right }) => {
    left.type = "long";
    left.width = 8;
  }),
  p("ID_TYPE", ["double"], ({ left, right }) => {
    left.type = "double";
    left.width = 8;
  }),
  // 方法及其声明语句
  p("METHOD", ["METHOD_DECLARE", "CODE_BLOCK"], ({ left, right }) => {
    left.code = right[1].code;
  }),
  p("METHOD", ["METHOD_DECLARE", ";"]),
  // 方法返回类型
  p("METHOD_RETURN_TYPE", ["ID_TYPE"]),
  p("METHOD_RETURN_TYPE", ["void"]),
  // 方法声明
  p("METHOD_DECLARE", ["METHOD_RETURN_TYPE", "id", "(", ")"]),
  p("METHOD_DECLARE", [
    "METHOD_RETURN_TYPE",
    "id",
    "(",
    "METHOD_PARAM_DECLARE_LIST",
    ")"
  ]),
  // 方法参数声明列表
  p("METHOD_PARAM_DECLARE", ["ID_TYPE", "id"]),
  p("METHOD_PARAM_DECLARE_LIST", ["METHOD_PARAM_DECLARE"]),
  p("METHOD_PARAM_DECLARE_LIST", [
    "METHOD_PARAM_DECLARE",
    ",",
    "METHOD_PARAM_DECLARE_LIST"
  ]),
  // break语句
  p("BREAK_STMT", ["break", ";"]),
  // return 语句
  p("RETURN_STMT", ["return", "EXP", ";"]),
  p("RETURN_STMT", ["return", ";"]),
  // continue语句
  p("CONTINUE_STMT", ["continue", ";"]),
  //if语句
  p("IF_STMT", ["if", "(", "EXP", ")", "BASE_BLOCK"], ({ left, right }) => {
    right[1].true = newLabel();
    right[1].false = right[4].next = left.next;
    left.code = left.label + ": " + right[2].code;
    left.code += "if " + right[2].addr + " goto " + right[1].true + "\n";
    if (left.next) left.code += "goto " + right[1].false + "\n";
    left.code += label(right[1].true) + right[4].code;
  }),
  p(
    "IF_ELSE_STMT",
    ["if", "(", "EXP", ")", "BASE_BLOCK", "else", "BASE_BLOCK"],
    ({ left, right }) => {
      right[1].true = newLabel();
      right[1].false = newLabel();
      right[4].next = right[6].next = left.next;
      left.code = left.label + ": " + right[2].code;
      left.code += "if " + right[2].addr + " goto " + right[1].true + "\n";
      left.code += "goto " + right[1].false + "\n";
      left.code += label(right[1].true) + right[4].code;
      left.code += "goto " + left.next + "\n";
      left.code += label(right[1].false) + right[6].code;
    }
  ),
  // switch语句
  p("SWITCH_STMT", ["switch", "(", "EXP", ")", "{", "DEFAULT_CASE_STMTS", "}"]),
  p("DEFAULT_CASE_STMTS", ["DEFAULT_STMT", "CASE_STMTS"]),
  p("DEFAULT_CASE_STMTS", ["CASE_STMTS", "DEFAULT_STMT"]),
  p("DEFAULT_CASE_STMTS", ["DEFAULT_STMT", "CASE_STMTS", "DEFAULT_STMT"]),
  p("DEFAULT_STMT", ["default", ":", "STMTS", "BREAK_STMT"]),
  p("DEFAULT_STMT", ["default", ":", "STMTS"]),
  p("CASE_STMTS", ["CASE_STMT", "CASE_STMTS"]),
  p("CASE_STMT", ["case", "num", ":", "STMTS", "BREAK_STMT"]),
  p("CASE_STMT", ["case", "num", ":", "STMTS"]),
  // while语句
  p(
    "WHILE_STMT",
    ["while", "(", "EXP", ")", "BASE_BLOCK"],
    ({ left, right }) => {
      right[1].true = newLabel();
      right[1].false = right[4].next = left.next;
      left.code = left.label + ": " + right[2].code;
      left.code += "if " + right[2].addr + " goto " + right[1].true + "\n";
      left.code += "goto " + right[1].false + "\n";
      left.code += label(right[1].true) + right[4].code;
      left.code += "goto " + left.label + "\n";
    }
  ),
  // do while语句
  p(
    "DO_WHILE_STMT",
    ["do", "CODE_BLOCK", "while", "(", "EXP", ")", ";"],
    ({ left, right }) => {
      right[4].true = left.label;
      right[4].false = right[1].next = left.next;
      left.code = left.label + ": " + right[1].code;
      left.code += right[4].code;
      left.code += "if " + right[4].addr + " goto " + right[4].true + "\n";
      left.code += "goto " + right[4].false + "\n";
    }
  ),
  p("FOR_STMT_1", ["ID_DECLARE_STMT"], singleRightRule),
  p("FOR_STMT_1", ["METHOD_INVOKE_STMT"], singleRightRule),
  p("FOR_STMT_1", ["ASSIGN_STMT"], singleRightRule),
  p("FOR_STMT_1", [";"], singleRightRule),
  p(
    "FOR_STMT",
    ["for", "(", "FOR_STMT_1", "EXP", ";", "EXP", ")", "BASE_BLOCK"],
    ({ left, right }) => {
      right[3].true = right[7].label = newLabel();
      right[3].false = left.next;
      left.code = left.label + ": " + right[2].code;
      let boolLabel = newLabel();
      left.code += boolLabel + ": " + right[3].code;
      left.code += "if " + right[3].addr + " goto " + right[3].true + "\n";
      left.code += "goto " + right[3].false + "\n";
      left.code += right[3].true + ": " + right[7].code + right[5].code;
      left.code += "goto " + boolLabel + "\n";
    }
  ),
  // 变量声明语句
  p(
    "ID_DECLARE_STMT",
    ["ID_TYPE", "ID_DECLARE_LIST", ";"],
    ({ left, right }) => {
      left.code = right[1].code;
    }
  ),
  p(
    "ID_DECLARE_LIST",
    ["ID_DECLARE", ",", "ID_DECLARE_LIST"],
    ({ left, right }) => {
      left.code = right[0].code + right[2].code;
    }
  ),
  p("ID_DECLARE_LIST", ["ID_DECLARE"], singleRightRule),
  p("ID_DECLARE", ["EXP"], ({ left, right }) => {
    left.code = right[0].code;
  }),
  p("ID_DECLARE", ["id"], singleRightRule),
  // 方法调用语句
  p("METHOD_INVOKE_STMT", ["METHOD_INVOKE", ";"]),
  // 赋值语句
  p("ASSIGN_STMT", ["EXP", ";"], ({ left, right }) => {
    left.code = right[0].code;
  })
];
for (let i = 13; i > 1; i--) {
  Products.push(
    p("EXP" + i, ["EXP" + (i - 1)], ({ left, right }) => {
      left.addr = right[0].addr;
      left.code = right[0].code;
    })
  );
}
// module.exports = exp;

/**
 * 产生式数组
 */
/*
let Products = [
  p("PROGRAM", ["METHOD", "_PROGRAM"]),
  p("_PROGRAM", ["METHOD", "_PROGRAM"]),
  p("_PROGRAM", [NIL]),
  p("EXP", ["EXP13"]),
  p("EXP13", ["EXP12", "_EXP13"]),
  p("_EXP13", ["?", "EXP12", ":", "EXP12", "_EXP13"]),
  p("_EXP13", [NIL]),
  p("EXP12", ["EXP11", "_EXP12"]),
  p("_EXP12", ["||", "EXP11", "_EXP12"]),
  p("_EXP12", [NIL]),
  p("EXP11", ["EXP10", "_EXP11"]),
  p("_EXP11", ["&&", "EXP10", "_EXP11"]),
  p("_EXP11", [NIL]),
  p("EXP10", ["EXP9", "_EXP10"]),
  p("_EXP10", ["|", "EXP9", "_EXP10"]),
  p("_EXP10", [NIL]),
  p("EXP9", ["EXP8", "_EXP9"]),
  p("_EXP9", ["^", "EXP8", "_EXP9"]),
  p("_EXP9", [NIL]),
  p("EXP8", ["EXP7", "_EXP8"]),
  p("_EXP8", ["&", "EXP7", "_EXP8"]),
  p("_EXP8", [NIL]),
  p("EXP7", ["EXP6", "_EXP7"]),
  p("_EXP7", ["==", "EXP6", "_EXP7"]),
  p("_EXP7", ["!=", "EXP6", "_EXP7"]),
  p("_EXP7", [NIL]),
  p("EXP6", ["EXP5", "_EXP6"]),
  p("_EXP6", ["<", "EXP5", "_EXP6"]),
  p("_EXP6", [">", "EXP5", "_EXP6"]),
  p("_EXP6", ["<=", "EXP5", "_EXP6"]),
  p("_EXP6", [">=", "EXP5", "_EXP6"]),
  p("_EXP6", [NIL]),
  p("EXP5", ["EXP4", "_EXP5"]),
  p("_EXP5", ["<<", "EXP4", "_EXP5"]),
  p("_EXP5", [">>", "EXP4", "_EXP5"]),
  p("_EXP5", [NIL]),
  p("EXP4", ["EXP3", "_EXP4"]),
  p("_EXP4", ["+", "EXP3", "_EXP4"]),
  p("_EXP4", ["-", "EXP3", "_EXP4"]),
  p("_EXP4", [NIL]),
  p("EXP3", ["EXP2", "_EXP3"]),
  p("_EXP3", ["*", "EXP2", "_EXP3"]),
  p("_EXP3", ["/", "EXP2", "_EXP3"]),
  p("_EXP3", ["%", "EXP2", "_EXP3"]),
  p("_EXP3", [NIL]),
  p("EXP2", ["-", "EXP1"]),
  p("EXP2", ["--", "EXP1"]),
  p("EXP2", ["++", "EXP1"]),
  p("EXP2", ["EXP1", "_EXP2"]),
  p("_EXP2", ["++"]),
  p("_EXP2", ["--"]),
  p("_EXP2", [NIL]),
  p("EXP2", ["!", "EXP1"]),
  p("EXP2", ["~", "EXP1"]),
  p("EXP2", ["sizeof", "EXP1"]),
  p("EXP1", ["(", "EXP", ")"]),
  p("EXP1", ["num"]),
  p("EXP1", ["id", "_EXP1"]),
  p("_EXP1", ["METHOD_INVOKE"]),
  p("_EXP1", [NIL]),
  // 方法调用
  p("METHOD_INVOKE", ["(", "_METHOD_INVOKE"]),
  // 数组元素
  // p("ARRAY_ELEMENT", ["id", "[", "EXP", "]"]),
  p("EXP_LIST", ["EXP", "_EXP_LIST"]),
  p("_EXP_LIST", [",", "EXP"]),
  p("_EXP_LIST", [NIL]),
  p("BASE_BLOCK", ["CODE_BLOCK"]),
  p("BASE_BLOCK", ["STMT"]),
  p("CODE_BLOCK", ["{", "_CODE_BLOCK"]), //代码块
  p("_CODE_BLOCK", ["STMTS", "}"]), //代码块
  p("_CODE_BLOCK", ["}"]), //代码块
  p("STMTS", ["STMT", "_STMTS"]), //多条语句
  p("_STMTS", ["STMT", "_STMTS"]), //多条语句
  p("_STMTS", [NIL]), //多条语句
  p("STMT", ["ASSIGN_METHOD_INVOKE_STMT"]), //复制和方法调用语句
  p("STMT", ["ID_DECLARE_STMT"]), //变量声明语句
  p("STMT", ["IF_STMT"]), //if语句
  p("STMT", ["IF_ELSE_STMT"]), //if-else语句
  p("STMT", ["WHILE_STMT"]), //while语句
  p("STMT", ["DO_WHILE_STMT"]), //do-while语句
  p("STMT", ["SWITCH_STMT"]), //switch语句
  p("STMT", ["RETURN_STMT"]), //return语句
  p("STMT", [";"]), //空语句
  // p("STMT", ["FOR_STMT"]), //for语句
  // 基本数据类型
  p("ID_TYPE", ["short"]),
  p("ID_TYPE", ["int"]),
  p("ID_TYPE", ["long"]),
  p("ID_TYPE", ["float"]),
  p("ID_TYPE", ["double"]),
  p("ID_TYPE", ["char"]),
  // 方法及其声明语句
  p("METHOD", ["METHOD_DECLARE", "_METHOD"]),
  p("_METHOD", ["CODE_BLOCK"]),
  p("_METHOD", [";"]),
  // 方法返回类型
  p("METHOD_RETURN_TYPE", ["ID_TYPE"]),
  p("METHOD_RETURN_TYPE", ["void"]),
  // 方法声明
  p("METHOD_DECLARE", [
    "METHOD_RETURN_TYPE",
    "id",
    "(",
    "METHOD_PARAM_DECLARE_LIST",
    ")"
  ]),
  // 方法参数声明列表
  p("METHOD_PARAM_DECLARE", ["ID_TYPE", "id"]),
  p("METHOD_PARAM_DECLARE_LIST", [NIL]),
  p("METHOD_PARAM_DECLARE_LIST", [
    "METHOD_PARAM_DECLARE",
    "_METHOD_PARAM_DECLARE_LIST"
  ]),
  p("_METHOD_PARAM_DECLARE_LIST", [",", "METHOD_PARAM_DECLARE"]),
  p("_METHOD_PARAM_DECLARE_LIST", [NIL]),
  // break语句
  p("BREAK_STMT", ["break", ";"]),
  // return 语句
  p("RETURN_STMT", ["return","_RETURN_STMT", ";"]),
  p("_RETURN_STMT", ["EXP"]),
  p("_RETURN_STMT", [NIL]),
  // continue语句
  p("CONTINUE_STMT", ["continue", ";"]),
  //if语句
  p("IF_STMT", ["if", "(", "EXP", ")", "BASE_BLOCK"]),
  p("IF_ELSE_STMT", ["IF_STMT", "else", "BASE_BLOCK"]),
  // switch语句
  p("SWITCH_STMT", ["switch", "(", "EXP", ")", "{", "DEFAULT_CASE_STMTS", "}"]),
  p("DEFAULT_CASE_STMTS", ["DEFAULT_STMT", "CASE_STMTS"]),
  p("DEFAULT_CASE_STMTS", ["CASE_STMTS", "_DEFAULT_CASE_STMTS"]),
  p("_DEFAULT_CASE_STMTS", ["DEFAULT_STMT", "__DEFAULT_CASE_STMTS"]),
  p("__DEFAULT_CASE_STMTS", ["CASE_STMTS"]),
  p("__DEFAULT_CASE_STMTS", [NIL]),
  p("_DEFAULT_CASE_STMTS", [NIL]),
  p("DEFAULT_STMT", ["default", ":", "STMTS", "_DEFAULT_STMT"]),
  p("_DEFAULT_STMT", ["BREAK_STMT"]),
  p("_DEFAULT_STMT", [NIL]),
  p("CASE_STMTS", ["CASE_STMT", "_CASE_STMTS"]),
  p("_CASE_STMTS", ["CASE_STMT", "_CASE_STMTS"]),
  p("_CASE_STMTS", [NIL]),
  p("CASE_STMT", ["case", "num", ":", "STMTS", "_CASE_STMT"]),
  p("_CASE_STMT", ["BREAK_STMT"]),
  p("_CASE_STMT", [NIL]),
  // while语句
  p("WHILE_STMT", ["while", "(", "EXP", ")", "BASE_BLOCK"]),
  // do while语句
  p("DO_WHILE_STMT", ["do", "CODE_BLOCK", "while", "(", "EXP", ")", ";"]),
  // 变量声明语句
  p("ID_DECLARE_STMT", ["ID_TYPE", "ID_DECLARE_LIST", ";"]),
  p("ID_DECLARE_LIST", ["ID_DECLARE", "_ID_DECLARE_LIST"]),
  p("_ID_DECLARE_LIST", [",", "ID_DECLARE_LIST"]),
  p("_ID_DECLARE_LIST", [NIL]),
  p("ID_DECLARE", ["id", "_ID_DECLARE"]),
  p("_ID_DECLARE", ["=", "EXP"]),
  p("_ID_DECLARE", [NIL]),
  // 赋值和方法调用语句
  p("ASSIGN_METHOD_INVOKE_STMT", ["id", "_ASSIGN_METHOD_INVOKE", ";"]),
  // 赋值
  p("_ASSIGN_METHOD_INVOKE", ["=", "EXP"]),
  // 方法调用
  p("_ASSIGN_METHOD_INVOKE", ["(", "_METHOD_INVOKE"]),
  p("_METHOD_INVOKE", ["EXP_LIST", ")"]),
  p("_METHOD_INVOKE", [")"])
];*/
export {
  Products,
  KEYWORDS,
  TOKEN_TYPE,
  TOKEN_TAG,
  NIL,
  EOF,
  DELIMITERS,
  MATH_OPERATORS,
  BIT_OPERATORS,
  BIT_RELATION_OPERATORS,
  TERNARY_OPERATORS,
  LOGIC_OPERATORS,
  RELATION_OPERATORS
};
