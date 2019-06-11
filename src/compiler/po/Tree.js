let Token = require("./Token");
/**
 * 树
 * @param {*} name 根节点值
 * @param {Array<Tree>} children 子节点数组
 * @return {Tree} 树
 */
function Tree(name, children = [],rule=null) {
  this.name = name;
  if (!(children instanceof Array)) throw new Error("非法的子节点值:children");
  this.children = children;
  this.lastRootAccess = lastRootAccess;
  this.firstRootAccess = firstRootAccess;
  this.rightFirstLastRootAccess=rightFirstLastRootAccess;
}
/**
 * 后序遍历
 * @param {Tree} tree
 * @return {Array<Tree>}
 */
function lastRootAccess(tree) {
  let result = [];
  if (!(tree instanceof Tree)) throw new Error("非法的参数:tree");
  tree.children.map(t => {
    lastRootAccess(t).map(tt => {
      result.push(tt);
    });
  });
  result.push(tree);
  return result;
}
/**
 * 右优先后序遍历-右左根
 * @param {Tree} tree
 * @return {Array<Tree>}
 */
function rightFirstLastRootAccess(tree) {
  let result = [];
  if (!(tree instanceof Tree)) throw new Error("非法的参数:tree");
  for (let i=tree.children.length;i>=0;i--) {
    let t = tree.children[i];
    if(!t)continue;
    rightFirstLastRootAccess(t).map(tt => {
      result.push(tt);
    });
  }
  result.push(tree);
  return result;
}
/**
 * 先序遍历
 * @param {Tree} tree
 * @return {Array<Tree>}
 */
function firstRootAccess(tree) {
  let result = [];
  if (!(tree instanceof Tree)) throw new Error("非法的参数:tree");
  result.push(tree);
  tree.children.map(t => {
    lastRootAccess(t).map(tt => {
      result.push(tt);
    });
  });
  return result;
}
// module.exports = Tree;
export default Tree;
