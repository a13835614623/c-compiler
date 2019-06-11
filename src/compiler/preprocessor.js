/**
 * 简单的预处理器,删除所有注释以及预处理命令(暂时对预处理命令不做处理)
 * @param {String} code 处理前代码
 * @returns {String} 处理后的代码
 */
var preprocessor = function(code) {
  // 消除注释
  return deleteComment(deleteCommand(code));
};
/**
 * 去除多行注释,返回去除后的代码
 * @param {String} code 待处理代码
 * @returns {String} 处理后的代码
 */
var deleteMutiLineComment = code => {
  let leftComment = code.indexOf("/*");
  let rightComment = code.indexOf("*/");
  if (leftComment == -1 || rightComment == -1) return code;
  else
    return deleteMutiLineComment(
      code.slice(0, leftComment) + code.slice(rightComment + 2, code.length)
    );
};
/**
 * 删除单行注释
 * @param {String} code 待处理代码
 * @returns {String} 处理后的代码
 */
var deleteSingleLineComment = code => {
  let commentStart = code.indexOf("//");
  if (commentStart == -1) return code;
  else {
    // 注释前的部分
    let codeFore = code.slice(0, commentStart);
    // 注释后的部分
    let codeBack = code.slice(commentStart, code.length);
    codeBack = codeBack.slice(codeBack.indexOf("\n"), codeBack.length);
    // 递归调用
    return deleteSingleLineComment(codeFore + codeBack);
  }
};
/**
 * 删除单行和多行注释
 * @param {String} code 待处理代码
 * @returns {String} 处理后的代码
 */
var deleteComment = code => {
  return deleteMutiLineComment(deleteSingleLineComment(code));
};
// 预处理命令
const COMMANDS = [
  "#error",
  "#define",
  "#undef",
  "#include",
  "#include_next",
  "#if",
  "#ifdef",
  "#ifndef",
  "#elif",
  "#else",
  "#endif",
  "#line",
  "#pragma"
];
/**
 * 消除宏命令
 * @param {String} code 待处理代码
 * @returns {String} 处理后的代码
 */
var deleteCommand = code => {
  for (const command of COMMANDS) {
    let index = code.indexOf(command);
    // 注释前的部分
    let codeFore = code.slice(0, index);
    // 注释后的部分
    let codeBack = code.slice(index, code.length);
    codeBack = codeBack.slice(codeBack.indexOf("\n"), codeBack.length);
    code = codeFore + codeBack;
  }
  return code;
};
export default preprocessor;
// module.exports = preprocessor;
