/**
 * 语义分析
 */
var tree = null;
var tokens = [];
var symbols = [];
function SecmanticAnalyzer(grammarTree, tokenArr, symbolArr) {
  tree = grammarTree;
  tokens = tokenArr;
  symbols = symbolArr;
}

function parse() {}
SecmanticAnalyzer.prototype.parse = parse;
export default SecmanticAnalyzer;
