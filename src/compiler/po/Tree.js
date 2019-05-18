let Token = require("./Token");
/**
 * 树
 * @param {*} val 根节点值
 * @param {Array<Tree>}  子节点数组
 */
function Tree(val, nodes = []) {
  this.val = val;
  if (!(nodes instanceof Array)) throw new Error("非法的子节点值:nodes");
  this.nodes = nodes;
}
module.exports = Tree;
