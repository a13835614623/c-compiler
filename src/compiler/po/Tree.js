let Token = require("./Token");
/**
 * 树
 * @param {*} val 根节点值
 * @param {Array<Tree>} children 子节点数组
 */
function Tree(name, children = []) {
  this.name = name;
  if (!(children instanceof Array)) throw new Error("非法的子节点值:children");
  this.children = children;
  this.lastRootAccess = lastRootAccess;
  this.firstRootAccess = firstRootAccess;
}
/**
 * 后续遍历
 * @param {Tree} tree
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
 * 先序遍历
 * @param {Tree} tree
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
module.exports = Tree;
