<template>
  <div class="page-container">
    <mu-appbar style="width: 100%;" color="primary" title="C编译器">
    </mu-appbar>
    <mu-row gutter>
      <mu-col span="2">
        <mu-stepper
          :active-step="activeStepIndex"
          orientation="vertical"
          :linear="false"
        >
          <mu-step v-for="(step, index) in steps" :key="index">
            <mu-step-button @click="onClickStep(step, index)">
              {{ step.title }}
            </mu-step-button>
          </mu-step>
        </mu-stepper>
      </mu-col>
      <mu-col span="10">
        <h1>{{ steps[activeStepIndex].title }}</h1>
        <mu-divider></mu-divider>
        <keep-alive>
          <router-view />
        </keep-alive>
      </mu-col>
    </mu-row>
  </div>
</template>

<script>
export default {
  name: "page-container",
  data() {
    let steps = [
      {
        title: "导入文件",
        link: "/import"
      },
      {
        title: "词法分析",
        link: "/lexicalAnalyzer"
      },
      {
        title: "语法分析",
        link: "/syntaxAnalyzer"
      },
      {
        title: "语义分析",
        link: "/semanticAnalyzer"
      },
      {
        title: "中间代码生成",
        link: "/intermediateCodeGenerator"
      },
      {
        title: "代码优化",
        link: "/codeOptimizer"
      },
      {
        title: "目标代码生成",
        link: "/codeGenerator"
      }
    ];
    let pathMap = {};
    steps.map((step, index) => {
      pathMap[step.link] = index;
    });
    return {
      steps,
      // 当前步骤的索引
      activeStepIndex: 0,
      pathMap
    };
  },
  created() {
    this.activeStepIndex = this.pathMap[this.$route.path];
  },
  methods: {
    // 点击步骤
    onClickStep(step, index) {
      this.activeStepIndex = index;
      this.$store.commit("SET_STEP", step);
      this.$router.push(step.link);
      console.log(`点击了${step.title},link=${step.link},activeIndex=${index}`);
    },
    onNext() {
      this.activeStep++;
    }
  }
};
</script>

<style lang="scss" scoped>
.page-container {
  padding: 0;
  .row {
    height: 200px;
    margin: 20px 0;
  }
}
</style>
