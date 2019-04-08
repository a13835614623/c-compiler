/**
 * 本文件定义所有常量
 */
const TOKENS = {
  ID: "自定义标识符", //标识符
  NUMBER: "数字", //数字
  RELATION_OPERATOR: "关系运算符", //关系运算符
  MATH_OPERATOR: "算术运算符", //算术运算符
  LOGIC_OPERATOR: "逻辑运算符", //逻辑运算符
  BIT_OPERATOR: "位运算符", //位运算符
  DELIMITERS: "括号分隔符", // 括号分隔符
  ASSIGNMENT: "赋值符", //赋值符
  SECMICOLON: "分号", //分号
  COMMA: "逗号运算符", //逗号
  TERNARY_OPERATORS: "三目运算符" //三目运算符
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
export {
  KEYWORDS,
  TOKENS,
  DELIMITERS,
  RELATION_OPERATORS,
  BIT_OPERATORS,
  TERNARY_OPERATORS,
  MATH_OPERATORS,
  LOGIC_OPERATORS,
  BIT_RELATION_OPERATORS
};
