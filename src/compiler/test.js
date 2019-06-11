import Token from "./po/Token";
import Analyzer from "./syntax-analyzer";
import Lexer from "./lexer";
import SemanticAnalyzer from "./semantic-analyzer";
import CodeGenerator from "./mid-code-generator";
import LRAnalyzer from "./syntax-analyzer-LR";
import { Products } from "./constant";
// let analyzer = new AnalyzerString("E", products);
let code = `
void main()
{
    int a=1,b=2,c=5;
    a=b*5+6*8;
    if(a>b){
        a=20;
    }
    while(a<b){
        a++;
    }
    if(a>c){
        a=c;
    }else{
        a=b;
    }
    for(int i=0;i<20;i++){
        a=b+c;
    }
}`;
// Products.map((p)=>{
//   console.log(p.toString())
// })
let analyzer = new Analyzer(new Token("PROGRAM"), Products);
let lexer = new Lexer(code);
let tokens = lexer.parseAll();
let lr = new LRAnalyzer(Products[1].left, Products, lexer.symbols);
let { infos, tree } = lr.parse(tokens);
// 语义分析
let semanticAnalyzer = new SemanticAnalyzer(tree, tokens, lexer.symbols);
semanticAnalyzer.parse();
// 中间代码生成
let codeGenerator = new CodeGenerator(tree);
codeGenerator.generator();
