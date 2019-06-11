import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    activeStep: {}, //当前步骤
    sourceCode: "", //源代码
    symbols: [], //符号表
    tokens: [], //token数组
    tree: null //语法树
  },
  mutations: {
    SET_STEP(state, step) {
      state.activeStep = step;
    },
    SAVE_CODE(state, sourceCode) {
      state.sourceCode = sourceCode;
    },
    SAVE_SYMBOLS(state, symbols) {
      state.symbols = symbols;
    },
    SAVE_TOKENS(state, tokens) {
      state.tokens = tokens;
    },
    SAVE_TREE(state, tree) {
      state.tree = tree;
    }
  },
  actions: {}
});
