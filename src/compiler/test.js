let Analyzer = require("./syntax-analyzer");
let Product = require("./po/Product");
var { NIL, EOF } = require("./constant");

let analyzer = new Analyzer("E", [
  new Product("E", ["id"]),
  new Product("E", ["id", "+", "E"])
]);
let tree = analyzer.parse(["id", "+", "id"]);
console.log(tree);
