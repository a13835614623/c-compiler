import Product from "./po/Product";
import Token from "./po/Token";
import Tree from "./po/Tree";
const NIL = new Token("ε");
const EOF = new Token("$");
var Products = []; //产生式集合
// 开始符号
var start = null;

var terminals = []; //终结符集合
var nonTerminals = []; //非终结符集合
var firstCollection = []; //first集合
var followCollection = []; //follow集合
var table = {}; //预测语法分析表
Array.prototype.index = function(item) {
  for (let i = 0; i < this.length; i++) {
    if (this[i].equals(item)) return i;
  }
  return -1;
};
/**
 * 语法分析器
 * @param {Token} s 开始符号
 * @param {Array<Product>} products 产生式数组
 */
function SyntaxAnalyzer(s, products) {
  Products = products; //产生式集合
  start = s; // 开始符号
  terminals = []; //终结符集合
  nonTerminals = []; //非终结符集合
  firstCollection = []; //first集合
  followCollection = []; //follow集合
  table = {}; //预测语法分析表
  Products = products;
  getTerminalsAndNonTerminals(Products); //获取终结符和非终结符
  firstCollection = getFirstCollection(); //获取first集
  followCollection = getFollowCollection(); //获取follow集
  constructPredictiveGrammarAnalysisTable(); //构造预测语法分析表
  this.parse = parse;
}
/**
 * 获取非终结符nonTerminal所有的产生式
 * @param {*} nonTerminal
 */
function getProducts(nonTerminal) {
  return Products.filter(product => {
    return product.left.equals(nonTerminal);
  });
}
/**
 * 得到一组产生式的终结符和非终结符
 * @param {Array<Product>} products
 * @returns {t:Array<Token>,nt:Array<Token>}
 */
function getTerminalsAndNonTerminals(products) {
  if (products instanceof Array) {
    products.map(product => {
      if (nonTerminals.index(product.left) == -1) {
        nonTerminals.push(product.left);
      }
    });
    products.map(product => {
      product.right.map(ch => {
        if (
          !ch.equals(NIL) &&
          nonTerminals.index(ch) == -1 &&
          terminals.index(ch) == -1
        ) {
          terminals.push(ch);
        }
      });
    });
  }
  return {
    t: terminals,
    nt: nonTerminals
  };
}
/**
 * x是否为终结符
 * @param {Token} x 判断token
 * @param {Array<Token>} t 终结符集合
 */
function isTerminal(x) {
  return terminals.index(x) != -1;
}
/**
 * x是否为非终结符
 * @param {Token} x
 * @param {Array<Token>} nt
 */
function isNonTerminal(x) {
  return nonTerminals.index(x) != -1;
}
/**
 * 得到符号x的first集
 * @param {Object} firstCollection 已经求得的first集
 * @param {String} x  终结符或者非终结符
 */
function first(firstCollection, x) {
  if (!firstCollection[x]) firstCollection[x] = [];
  let token = new Token(x);
  //如果x是非终结符
  if (isNonTerminal(token)) {
    let products = getProducts(token);
    // 若存在X->e，则将e加入FIRST(X)
    products.map(product => {
      let right = product.right;
      if (right[0].equals(NIL) && firstCollection[x].index(NIL) == -1) {
        firstCollection[x].push(NIL);
      } else {
        for (let i = 0; i < right.length; i++) {
          //如果firstCollection[right[i]]为空,计算firstCollection[right[i]]
          if (!firstCollection[right[i].word]) {
            first(firstCollection, right[i].word);
          }
          // 如果firstCollection[right[i]]可以推出e,将firstCollection[right[i+1]]-e加入firstCollection[x]
          if (firstCollection[right[i].word].index(NIL) != -1) {
            // firstCollection[x]不包含e且i为末尾元素,则把NIL加入e
            if (i == right.length - 1) {
              if (firstCollection[x].index(NIL) == -1)
                firstCollection[x].push(NIL);
            } else {
              if (!firstCollection[right[i + 1].word]) {
                first(firstCollection, right[i + 1].word);
              }
              firstCollection[right[i + 1].word].filter(item => {
                if (firstCollection[x].index(item) == -1)
                  firstCollection[x].push(item);
              });
            }
          } else {
            //如果不能推出e,结束计算。
            firstCollection[right[i].word].map(item => {
              if (firstCollection[x].index(item) == -1)
                firstCollection[x].push(item);
            });
            break;
          }
        }
      }
    });
  } else {
    // 如果是终结符
    firstCollection[x].push(token);
  }
  return firstCollection[x];
}
/**
 * 获得符号串tokens的first集
 * @param {Object} firstCollection
 * @param {Array<Token>} tokens 符号串
 */
function firsts(firstCollection, tokens) {
  if (!tokens[0]) return null;
  if (isTerminal(tokens[0])) return [tokens[0]];
  let result = firstCollection[tokens[0].word].filter(item => {
    return !item.equals(NIL);
  });
  for (let i = 0; i < tokens.length; i++) {
    // 如果firstCollection[tokens[i]]可以推出e,将firstCollection[tokens[i+1]]-e加入result
    if (firstCollection[tokens[i].word].index(NIL) != -1) {
      // result不包含e且i为末尾元素,则把NIL加入e
      if (i == tokens.length - 1) {
        if (result.index(NIL) == -1) result.push(NIL);
      } else {
        firstCollection[tokens[i + 1].word].filter(item => {
          if (result.index(item) == -1) result.push(item);
        });
      }
    } else {
      //如果不能推出e,结束计算。
      firstCollection[tokens[i].word].map(item => {
        if (result.index(item) == -1) result.push(item);
      });
      break;
    }
  }
  return result;
}
/**
 * 获取first集
 */
function getFirstCollection() {
  let firstCollection = {};
  nonTerminals.map(nt => {
    firstCollection[nt.word] = [];
  });
  while (true) {
    let lengths = 0;
    for (const key in firstCollection) {
      lengths += firstCollection[key].length;
    }
    nonTerminals.map(x => {
      first(firstCollection, x.word);
    });
    let lengths2 = 0;
    for (const key in firstCollection) {
      lengths2 += firstCollection[key].length;
    }
    if (lengths == lengths2) break;
  }
  return firstCollection;
}
/**
 * 获取follow集
 */
function getFollowCollection() {
  let followCollection = {};
  // 对所有非终结符X，FOLLOW(X)置为空集
  nonTerminals.map(nt => {
    followCollection[nt.word] = [];
  });
  // FOLLOW(S)={$}，S为开始符号
  followCollection[start.word] = [EOF];
  while (true) {
    let isChange = false;
    Products.map(product => {
      let right = product.right;
      right.map((x, i) => {
        //如果xi为非终结符
        if (isNonTerminal(x)) {
          let isCanGetNIL = false;
          if (i < right.length - 1)
            // Follow(Xi)=Follow(Xi)U(First(Xi+1,…,Xm)-{e});
            firsts(firstCollection, right.slice(i + 1)).map(item => {
              if (item.equals(NIL)) isCanGetNIL = true;
              else if (followCollection[x.word].index(item) == -1) {
                isChange = true;
                followCollection[x.word].push(item);
              }
            });
          // 如果为最后一个元素或者First(Xi+1,…,Xm)能够推出e
          if (isCanGetNIL || i == right.length - 1) {
            followCollection[product.left.word].map(item => {
              if (followCollection[x.word].index(item) == -1) {
                isChange = true;
                followCollection[x.word].push(item);
              }
            });
          }
        }
      });
    });
    if (!isChange) break;
  }
  return followCollection;
}
/**
 *构造预测语法分析表
 */
function constructPredictiveGrammarAnalysisTable() {
  // 对每个产生式product.left->product.right
  Products.map(product => {
    let left = product.left;
    // 对所有的终结符a∈FIRST(left)，将product加入table[left, a]
    firsts(firstCollection, product.right).map(a => {
      if (isTerminal(a)) {
        if (!table[left.word]) table[left.word] = {};
        table[left.word][a.word] = product;
      }
      if (a.equals(NIL)) {
        followCollection[left.word].map(b => {
          if (!table[left.word]) table[left.word] = {};
          if (isTerminal(b)) table[left.word][b.word] = product;
          else if (b.equals(EOF)) {
            table[left.word][b.word] = product;
          }
        });
      }
    });
  });
  return table;
}
/**
 * 语法分析,返回语法树
 * @param {Array<Token>} tokens token数组
 * @return tree 语法树
 * @return infos 分析信息
 * @return products 输出产生式数组
 */
function parse(tokens = []) {
  if (!(tokens instanceof Array)) {
    throw new Error("非法的输入参数:tokens");
  }
  let ip = 0;
  let x = null;
  let a = null;
  let products = [];
  tokens.push(EOF);
  let stack = [EOF, start];
  let infos = [];
  var getTokens = function getTokens(tokenArr) {
    let a = "[";
    for (const t of tokenArr) {
      a += t.word + " ";
    }
    return a + "]";
  };
  let product = null;
  do {
    infos.push({
      stack: getTokens(stack),
      input: getTokens(tokens.slice(ip, tokens.length)),
      product:
        !product || product == products[products.length - 2]
          ? ""
          : product.toString()
    });
    product = null;
    a = tokens[ip];
    x = stack[stack.length - 1];
    if (isTerminal(x) || x.equals(EOF)) {
      if (x.equals(a)) {
        console.log(ip);
        x.type=a.type;
        x.description=a.description;
        stack.pop();
        ip++;
      } else {
        throw new Error("语法错误:非法的token" + x);
      }
    } else {
      product = table[x.word][a.word];
      if (product) {
        products.push(product);
        stack.pop();
        for (let i = product.right.length - 1; i >= 0; i--) {
          if (!product.right[i].equals(NIL)) stack.push(product.right[i]);
        }
      } else {
        throw new Error("语法错误:非法的token" + x);
      }
    }
  } while (!x.equals(EOF));
  let tree = new Tree(start);
  let leftNode = tree;
  // 生成语法树
  products.map(p => {
    let children = p.right.map(x => {
      return new Tree(x);
    });
    leftNode.children = children;
    let lastAccess = tree.lastRootAccess(tree);
    //获取树的后序遍历中第一个没有子节点的节点，进行下一轮推导
    for (let i = 0; i < lastAccess.length; i++) {
      if (!lastAccess[i].children[0] && isNonTerminal(lastAccess[i].name)) {
        leftNode = lastAccess[i];
        break;
      }
    }
  });
  return { products, tree, infos };
}
// module.exports = SyntaxAnalyzer;
export default SyntaxAnalyzer;
