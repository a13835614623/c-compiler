var Product = require("./po/Product");
var Token = require("./po/Token");
var Tree = require("./po/Tree");
var { NIL, EOF } = require("./constant");
var Products = []; //产生式集合
// 开始符号
var start = "";
var terminals = []; //终结符集合
var nonTerminals = []; //非终结符集合
var firstCollection = []; //first集合
var followCollection = []; //follow集合
var table = {}; //预测语法分析表
/**
 * 语法分析器
 * @param {String} s 开始符号
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
  getTerminalsAndNonTerminals(Products);
  eliminateLeftRecursion(); //消除左递归
  eliminateCommonLeftFactor(); //消除公共左因子
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
    return product.left == nonTerminal;
  });
}
/**
 * 得到一组产生式的终结符和非终结符
 * @param {Array<Product>} products
 * @returns {t:Array<String>,nt:Array<String>}
 */
function getTerminalsAndNonTerminals(products) {
  if (products instanceof Array) {
    products.map(product => {
      if (nonTerminals.indexOf(product.left) == -1) {
        nonTerminals.push(product.left);
      }
    });
    products.map(product => {
      product.right.map(ch => {
        if (
          ch != NIL &&
          nonTerminals.indexOf(ch) == -1 &&
          terminals.indexOf(ch) == -1
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
 * @param {String} x 判断字符
 * @param {Array<String>} t 终结符集合
 */
function isTerminal(x) {
  return terminals.indexOf(x) != -1;
}
/**
 * x是否为非终结符
 * @param {String} x
 * @param {Array<String>} nt
 */
function isNonTerminal(x) {
  return nonTerminals.indexOf(x) != -1;
}
/**
 * 得到符号x的first集
 * @param {Object} firstCollection 已经求得的first集
 * @param {String} x  终结符或者非终结符
 */
function first(firstCollection, x) {
  if (!firstCollection[x]) firstCollection[x] = [];
  //如果x是非终结符
  if (isNonTerminal(x)) {
    let products = getProducts(x);
    // 若存在X->e，则将e加入FIRST(X)
    products.map(product => {
      let right = product.right;
      if (right[0] == NIL && firstCollection[x].indexOf(NIL) == -1) {
        firstCollection[x].push(NIL);
      } else {
        for (let i = 0; i < right.length; i++) {
          //如果firstCollection[right[i]]为空,计算firstCollection[right[i]]
          if (!firstCollection[right[i]]) {
            first(firstCollection, right[i]);
          }
          // 如果firstCollection[right[i]]可以推出e,将firstCollection[right[i+1]]-e加入firstCollection[x]
          if (firstCollection[right[i]].indexOf(NIL) != -1) {
            // firstCollection[x]不包含e且i为末尾元素,则把NIL加入e
            if (i == right.length - 1) {
              if (firstCollection[x].indexOf(NIL) == -1)
                firstCollection[x].push(NIL);
            } else {
              if (!firstCollection[right[i + 1]]) {
                first(firstCollection, right[i + 1]);
              }
              firstCollection[right[i + 1]].filter(item => {
                if (firstCollection[x].indexOf(item) == -1)
                  firstCollection[x].push(item);
              });
            }
          } else {
            //如果不能推出e,结束计算。
            firstCollection[right[i]].map(item => {
              if (firstCollection[x].indexOf(item) == -1)
                firstCollection[x].push(item);
            });
            break;
          }
        }
      }
    });
  } else {
    // 如果是终结符
    firstCollection[x].push(x);
  }
  return firstCollection[x];
}
/**
 * 获得符号串xs的first集
 * @param {Object} firstCollection
 * @param {Array<String>} xs 符号串
 */
function firsts(firstCollection, xs) {
  if (!xs[0]) return null;
  if (isTerminal(xs[0])) return [xs[0]];
  let result = firstCollection[xs[0]].filter(item => {
    return item != NIL;
  });
  for (let i = 0; i < xs.length; i++) {
    // 如果firstCollection[xs[i]]可以推出e,将firstCollection[xs[i+1]]-e加入result
    if (firstCollection[xs[i]].indexOf(NIL) != -1) {
      // result不包含e且i为末尾元素,则把NIL加入e
      if (i == xs.length - 1) {
        if (result.indexOf(NIL) == -1) result.push(NIL);
      } else {
        firstCollection[xs[i + 1]].filter(item => {
          if (result.indexOf(item) == -1) result.push(item);
        });
      }
    } else {
      //如果不能推出e,结束计算。
      firstCollection[xs[i]].map(item => {
        if (result.indexOf(item) == -1) result.push(item);
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
    firstCollection[nt] = [];
  });
  while (true) {
    let lengths = 0;
    for (const key in firstCollection) {
      lengths += firstCollection[key].length;
    }
    nonTerminals.map(x => {
      first(firstCollection, x);
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
    followCollection[nt] = [];
  });
  // FOLLOW(S)={$}，S为开始符号
  followCollection[start] = [EOF];
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
              if (item == NIL) isCanGetNIL = true;
              else if (followCollection[x].indexOf(item) == -1) {
                isChange = true;
                followCollection[x].push(item);
              }
            });
          // 如果为最后一个元素或者First(Xi+1,…,Xm)能够推出e
          if (isCanGetNIL || i == right.length - 1) {
            followCollection[product.left].map(item => {
              if (followCollection[x].indexOf(item) == -1) {
                isChange = true;
                followCollection[x].push(item);
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
 * 消除左递归
 */
function eliminateLeftRecursion() {
  nonTerminals.map(nt => {
    let products = getProducts(nt);
    let betas = [[]],
      as = [[]];
    let left = nt,
      newLeft = left + "'";
    //是否存在左递归
    let isHasLeftRecursion = false;
    products.map(product => {
      let right = product.right;
      if (left == right[0]) {
        as.push(right.slice(1));
        isHasLeftRecursion = true;
      } else {
        betas.push(right);
      }
    });
    //如果存在左递归,则进行消除
    if (isHasLeftRecursion) {
      products.map(product => {
        // 移除原产生式
        Products.splice(Products.indexOf(product), 1);
      });
      as.shift();
      betas.shift();
      betas.map(beta => {
        if (beta[beta.length - 1] != NIL) beta.push(newLeft);
        else beta[beta.length - 1] = newLeft;
        Products.push(new Product(left, beta));
      });
      as.map(a => {
        if (a[a.length - 1] != NIL) a.push(newLeft);
        else a[a.length - 1] = newLeft;
        Products.push(new Product(newLeft, a));
      });
      Products.push(new Product(newLeft, [NIL]));
      as.push(NIL);
    }
  });
}
/**
 * 消除公共左因子
 */
function eliminateCommonLeftFactor() {
  // 新增非终结符
  for (let ntIndex = 0; ntIndex < nonTerminals.length; ntIndex++) {
    let nt = nonTerminals[ntIndex];
    while (true) {
      let isHasCommonLeft = false;
      let products = getProducts(nt);
      for (let i = 0; i < products.length; i++) {
        for (let j = i + 1; j < products.length; j++) {
          let n = 0;
          while (products[i].right[n] == products[j].right[n]) n++;
          //公共左因子
          let commonLeftFactor = products[i].right.slice(0, n);
          let newLeft = products[i].left + "'";
          if (commonLeftFactor && n != 0) {
            if (nonTerminals.indexOf(newLeft) == -1) nonTerminals.push(newLeft);
            isHasCommonLeft = true;
            // 移除原产生式
            Products.splice(Products.indexOf(products[i]), 1);
            Products.splice(Products.indexOf(products[j]), 1);
            // 添加消除公共左因子后的新产生式
            commonLeftFactor.push(newLeft);
            Products.push(new Product(products[i].left, commonLeftFactor));
            let tmp = products[i].right.slice(n);
            if (newLeft != tmp[0])
              Products.push(new Product(newLeft, tmp[0] ? tmp : [NIL]));
            tmp = products[j].right.slice(n);
            if (newLeft != tmp[0])
              Products.push(new Product(newLeft, tmp[0] ? tmp : [NIL]));
            break;
          }
        }
        if (isHasCommonLeft) break;
      }
      // 公共左因子消除完毕
      if (!isHasCommonLeft) break;
    }
  }
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
        if (!table[left]) table[left] = {};
        table[left][a] = product;
      }
      if (a == NIL) {
        followCollection[left].map(b => {
          if (!table[left]) table[left] = {};
          if (isTerminal(b)) table[left][b] = product;
          else if (b == EOF) {
            table[left][b] = product;
          }
        });
      }
    });
  });
  return table;
}
/**
 * 语法分析,返回语法树
 * @param {Array<String|Token>} tokens token数组
 * @return {Tree} 语法树
 */
function parse(tokens = []) {
  if (!(tokens instanceof Array)) {
    throw new Error("非法的输入参数:tokens");
  }
  let tree = new Tree(start);
  let ip = 0;
  let x = null;
  let a = null;
  let products = [];
  tokens.push(EOF);
  let stack = [EOF, start];
  do {
    a = tokens[ip];
    x = stack[stack.length - 1];
    if (isTerminal(x) || x == EOF) {
      if (x == a) {
        stack.pop();
        ip++;
      } else {
        throw new Error("语法错误:非法的字符" + x);
      }
    } else {
      let product = table[x][a];
      if (product) {
        products.push(product);
        stack.pop();
        for (let i = product.right.length - 1; i >= 0; i--) {
          if (product.right[i] != NIL) stack.push(product.right[i]);
        }
      } else {
        throw new Error("语法错误:非法的字符" + x);
      }
    }
  } while (x != EOF);
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
  return tree;
}
module.exports = SyntaxAnalyzer;
// export default SyntaxAnalyzer;
