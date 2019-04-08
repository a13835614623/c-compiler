import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    activeStep: {},
    sourceCode: ""
  },
  mutations: {
    SET_STEP(state, step) {
      state.activeStep = step;
    },
    SAVE_CODE(state, sourceCode) {
      state.sourceCode = sourceCode;
    }
  },
  actions: {}
});
