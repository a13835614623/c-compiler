/**
 * LR语法分析
 */
import Product from "./po/Product";
import Token from "./po/Token";
import Tree from "./po/Tree";
var start = null; //开始符号
var Products = null; // 产生式
const NIL = new Token("ε");
const EOF = new Token("$");
// 动作
const ACTION = {
  SHIFT: "s", //移进
  REDUCE: "r", //规约
  ACCECPT: "acc" //接受
};
var terminals = []; //终结符集合
var nonTerminals = []; //非终结符集合
var firstCollection = []; //first集合
var followCollection = []; //follow集合
var Symbols = []; //符号表
var actions = null; //action表
var gotos = null; //goto表
var items = null; //LR(0)项目集规范族
/**
 * LR语法分析器
 * @param {Token} s 开始符号
 * @param {Array<Product>} products 产生式数组
 */
function LRAnalyzer(s, products, symbols = []) {
  start = s;
  Products = products;
  Symbols = symbols;
  getTerminalsAndNonTerminals(Products); //获取终结符和非终结符
  firstCollection = getFirstCollection(); //获取first集
  followCollection = getFollowCollection(); //获取follow集
  items = getItems(); //构造LR(0)项目集规范族
  gotos = constructGotoTable(); //构造goto表
  actions = constructActionTable(); //构造action表
}
//为数组添加equals方法，判断内容是否相等
Array.prototype.equals = function(arr) {
  if (this.length != arr.length) return false;
  for (let i = 0; i < this.length; i++) {
    if (this[i] != arr[i] && !this[i].equals(arr[i])) {
      return false;
    }
  }
  return true;
};
// 为products数组添加index方法，获取元素在数组中的索引
Array.prototype.index = function(item) {
  for (let i = 0; i < this.length; i++) {
    if (this[i].equals(item)) return i;
  }
  return -1;
};
/**
 * 获取项目集的ε-closure集合
 * @param {Array<Product>} products 项目集
 * @returns {Array<Product>} 项目集的ε-closure集合
 */
function getClosure(products) {
  let closureCollection = [];
  // 初始，products中项目都加入closure(I)
  products.map(p => {
    closureCollection.push(p.clone());
  });
  do {
    let length0 = closureCollection.length;
    // 若A->a·Bb属于closure(I)，且存在产生式B->g，则将 B->.g添加进closure(I)
    closureCollection.map(p => {
      let ps = getProducts(p.right[p.item]);
      ps.map(pp => {
        if (closureCollection.index(pp) == -1)
          closureCollection.push(pp.clone());
      });
    });
    //如果没有发生变化，则退出
    if (closureCollection.length == length0) break;
  } while (true);
  return closureCollection;
}
/**
 * 获取项目集的goto集合
 * @param {Array<Product>} products 项目集
 * @param {Token} token 下一个token
 * @returns {Array<Product>} 项目集的goto集合
 */
function getGoto(products, token) {
  let _products = [];
  // 找到标记的下一个为token的product
  products.map(p => {
    if (token.equals(p.right[p.item])) {
      let pClone = p.clone();
      pClone.item++;
      _products.push(pClone);
    }
  });
  return getClosure(_products);
}
/**
 * 构造LR(0)项目集规范族
 * @returns {Array<Array<Product>>} items LR(0)项目集规范族
 */
function getItems() {
  // 初始项目集
  let items = [getClosure([Products[0]])];
  // 文法符号集合
  let terminalsAndNonTeriminals = nonTerminals.concat(terminals);
  do {
    let length0 = items.length;
    items.map(I => {
      terminalsAndNonTeriminals.map(x => {
        let temp = getGoto(I, x);
        if (temp[0] && items.index(temp) == -1) {
          items.push(temp);
        }
      });
    });
    if (length0 == items.length) break;
  } while (true);
  return items;
}
/**
 * 构造actions表
 * @returns {Array<Object>} action表
 */
function constructActionTable() {
  let actions = new Array(items.length);
  let ts = terminals.concat(EOF);
  for (let i = 0; i < actions.length; i++) {
    actions[i] = {};
    ts.map(t => {
      if (t.word != start.word + "'") actions[i][t.word] = null;
    });
  }
  items.map((itemI, i) => {
    //遍历LR(0)项目集规范族
    itemI.map(p => {
      //LR(0)项目集
      if (p.item == p.right.length) {
        //.在最右边，规约项目
        if (p.left.word != start.word + "'") {
          followCollection[p.left.word].map(a => {
            let j = () => {
              let j = -1;
              Products.map((pp, ii) => {
                if (p.left.equals(pp.left) && p.right.equals(pp.right)) j = ii;
              });
              return j;
            };
            // 规约产生式p
            actions[i][a.word] = {
              action: ACTION.REDUCE,
              target: j()
            };
          });
        } else if (p.right[0].word == start.word) {
          // 若[S’->S·] 在Ii中，则令action[i, $]=“接受”
          actions[i][EOF.word] = {
            action: ACTION.ACCECPT
          };
        }
      } else {
        p.right.map(a => {
          //LR(0)项目
          if (p.item != p.right.length) {
            if (isTerminal(a)) {
              var itemJ = getGoto(itemI, a),
                j = items.index(itemJ);
              if (j != -1) {
                //移进j
                actions[i][a.word] = { action: ACTION.SHIFT, target: j };
              }
            }
          }
        });
      }
    });
  });
  return actions;
}
/**
 * 构造goto表
 * @returns {Array<Object>} goto表
 */
function constructGotoTable() {
  let gotos = new Array(items.length);
  for (let i = 0; i < gotos.length; i++) {
    gotos[i] = {};
    nonTerminals.map(nt => {
      if (nt.word != start.word + "'") gotos[i][nt.word] = null;
    });
  }
  items.map((item, i) => {
    nonTerminals.map(A => {
      if (A.word != start.word + "'") {
        let j = items.index(getGoto(item, A));
        if (j != -1) {
          gotos[i][A.word] = j;
        }
      }
    });
  });
  return gotos;
}
/**
 * 进行LR语法分析
 * @param {Array<Token>} tokens token数组
 * @returns {Array<Product>} product数组
 */
function parse(tokens = []) {
  if (!tokens[tokens.length - 1].equals(EOF)) tokens.push(EOF);
  let ip = 0;
  let stack = [0];
  let products = []; //规约所用产生式
  let infos = []; //分析过程
  let getTokens = function getTokens(tokenArr) {
    let a = "";
    for (const t of tokenArr) {
      a += (t.word ? t.word : t) + " ";
    }
    return a;
  };
  let top = () => {
    return stack[stack.length - 1];
  };
  let actionText = (action, product = null) => {
    if (action.action == ACTION.SHIFT) return "移进";
    if (action.action == ACTION.REDUCE) return "规约" + product.toString();
    if (action.action == ACTION.ACCECPT) return "接受";
  };
  do {
    let s = top(); //栈顶状态
    let a = tokens[ip]; //ip指向符号
    let action = actions[s][a.word];
    if (action) {
      let info = {
        stack: getTokens(stack),
        input: getTokens(tokens.slice(ip)),
        remark: actionText(action, Products[action.target])
      };
      // console.log(`${info.stack}     ${info.input}     ${info.remark}`);
      infos.push(info);
      if (action.action == ACTION.SHIFT) {
        //移进
        stack.push(a);
        stack.push(action.target);
        ip++;
      } else if (action.action == ACTION.REDUCE) {
        //规约
        let p = Products[action.target]; //规约的产生式
        for (let i = 0; i < p.right.length * 2; i++) {
          stack.pop();
        }
        let _s = top();
        stack.push(p.left.word);
        stack.push(gotos[_s][p.left.word]);
        let pClone = p.clone();
        // pClone.right.map((r, index) => {
        //   if (r.word == "id") {
        //     pClone.right[index] = tokens[ip - pClone.right.length + index].clone();
        //     pClone.right[index].addr = Symbols[pClone.right[index].description];
        //   } else if (r.word == "num") {
        //     pClone.right[index] = tokens[ip - pClone.right.length + index].clone();
        //     pClone.right[index].addr = pClone.right[index].description;
        //   }
        // });
        products.push(pClone);
      } else if (action.action == ACTION.ACCECPT) {
        //接受
        break;
      } else {
        throw new Error("语法错误:" + a);
      }
    } else {
      throw new Error("语法错误:" + a);
    }
  } while (true);
  let tree = new Tree(start);
  let rightNode = tree;
  // 生成语法树
  for (let i = products.length - 1; i >= 0; i--) {
    let p = products[i];
    let children = p.right.map(x => {
      return new Tree(x.clone());
    });
    rightNode.rule = p.rule;
    rightNode.product = p.toString();
    rightNode.children = children;
    let lastAccess = tree.lastRootAccess(tree);
    //获取树的后序遍历中最后一个没有子节点的节点，进行下一轮推导
    for (let i = lastAccess.length - 1; i >= 0; i--) {
      if (!lastAccess[i].children[0] && isNonTerminal(lastAccess[i].name)) {
        rightNode = lastAccess[i];
        break;
      }
    }
  }
  //格式化语法树
  formatTree(tokens, tree);
  return { products, infos, tree };
}
/**
 * 格式化树，设定语句标号，为num和id赋值
 * @param {Array<Token>} tokens token数组
 * @param {Tree} tree 语法树
 */
function formatTree(tokens, tree) {
  let i = 0;
  let trees = tree.lastRootAccess(tree);
  // 为num和id赋值
  trees.map(t => {
    if (t.name.word == "num") {
      t.name.addr = tokens[i].description;
    } else if (t.name.word == "id") {
      t.name.addr = Symbols[tokens[i].description];
    }
    if (!t.children[0]) i++;
  });
  // 设定语句的标号
  trees.map(function(t) {
    if (t.name.word == "STMTS") {
      t.children[0].children[0].name.label = "S" + i++;
      console.log(t.children[0].children[0].name.word + ".label:S" + (i - 1));
    }
  });
  trees.map(function(t) {
    if (t.name.word == "STMTS") {
      if (t.children[1]) {
        t.children[0].children[0].name.next =
          t.children[1].children[0].children[0].name.label;
      } else {
        t.children[0].children[0].name.next = "END";
      }
    }
  });
}
/**
 * 获取非终结符nonTerminal为左部所有的产生式
 * @param {Token} nonTerminal 非终结符
 * @returns {Array<Product>} 产生式数组
 */
function getProducts(nonTerminal) {
  return Products.filter(product => {
    return product.left.equals(nonTerminal);
  });
}
/**
 * 获取一组产生式的终结符和非终结符
 * @param {Array<Product>} products 产生式数组
 * @returns {Array<Token>} t  终结符数组
 * @returns {Array<Token>} nt  非终结符数组
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
 * 是否为终结符
 * @param {Token} x 判断token
 * @returns {Boolean} 判断结果
 */
function isTerminal(x) {
  return terminals.index(x) != -1;
}
/**
 * 是否为非终结符
 * @param {Token} x 判断token
 * @returns {Boolean} 判断结果
 */
function isNonTerminal(x) {
  return nonTerminals.index(x) != -1;
}
/**
 * 获取符号x的first集
 * @param {Object} firstCollection 已经求得的first集
 * @param {String} x  终结符或者非终结符的字符串
 * @returns {Array<Token>} token数组
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
 * @param {Object} firstCollection 已经求得的first集
 * @param {Array<Token>} tokens 符号串
 * @returns {Array<Token>} token数组
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
 * @returns {Object} first集合对象
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
 * @returns {Object} follow集合对象
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
LRAnalyzer.prototype.parse = parse;
LRAnalyzer.prototype.getClosure = getClosure;
LRAnalyzer.prototype.getGoto = getGoto;
LRAnalyzer.prototype.getItems = getItems;
LRAnalyzer.prototype.constructActionTable = constructActionTable;
LRAnalyzer.prototype.constructGotoTable = constructGotoTable;
export default LRAnalyzer;
