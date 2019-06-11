import Tree from "./po/Tree";
/**
 * 中间代码生成
 * @param {Tree}语法树
 */
function CodeGenerator(gammarTree) {
  tree = gammarTree;
}
var tree = [];
/**
 * 生成中间代码
 * @returns {Array<object>} codes 每步的生成的三地址代码
 */
function generator() {
  let trees = tree.lastRootAccess(tree);
  let codes = [];
  trees.map((t, i) => {
    if (t.rule) {
      let tmp = {
        left: t.name,
        right: t.children.map(c => {
          return c.name;
        })
      };
      t.rule(tmp);
      codes.push({
        product: t.product.toString(),
        code: t.name.code
      });
      console.log(t.product, "code:" + t.name.code);
    }
  });
  return codes;
}
CodeGenerator.prototype.generator = generator;
export default CodeGenerator;
