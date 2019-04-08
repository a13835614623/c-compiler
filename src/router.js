import Vue from "vue";
import Router from "vue-router";
import pageContainer from "./components/page-container";

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: "/",
      name: "home",
      redirect: "/import",
      component: pageContainer,
      children: [
        {
          path: "import",
          name: "code-import",
          component: () => import("./components/base/code-import")
        },
        {
          path: "lexicalAnalyzer",
          name: "lexicalAnalyzer",
          component: () => import("./components/base/lexical-analyzer")
        },
        {
          path: "syntaxAnalyzer",
          name: "syntaxAnalyzer",
          component: () => import("./components/base/syntax-analyzer")
        },
        {
          path: "semanticAnalyzer",
          name: "semanticAnalyzer",
          component: () => import("./components/base/semantic-analyzer")
        },
        {
          path: "intermediateCodeGenerator",
          name: "intermediateCodeGenerator",
          component: () =>
            import("./components/base/intermediate-code-generator")
        },
        {
          path: "codeOptimizer",
          name: "codeOptimizer",
          component: () => import("./components/base/code-optimizer")
        },
        {
          path: "codeGenerator",
          name: "codeGeneraoer",
          component: () => import("./components/base/code-generator")
        }
      ]
    }
  ]
});
