<template>
  <mu-paper :z-depth="2" class="paper">
    <pre v-if="code">{{ code }}</pre>
    <div v-else style="text-align:center;padding-top:200px;">
      <h2 class="caption">{{ empty }}</h2>
    </div>
  </mu-paper>
</template>

<script>
import { setInterval } from "timers";
export default {
  name: "code-show",
  props: {
    code: {
      type: String,
      default: "",
      required: false
    },
    empty: {
      type: String,
      default: "暂未导入源代码",
      required: false
    }
  },
  updated() {
    this.$emit("update:height", this.$el.offsetHeight);
  },
  mounted() {
    this.$nextTick(() => {
      //使用nextTick为了保证dom元素都已经渲染完毕
      this.$emit("update:height", this.$el.offsetHeight);
    });
  },
  data() {
    return {};
  },
  methods: {}
};
</script>

<style lang="scss" scoped>
.paper {
  min-height: 500px;
  min-width: 500px;
  background: rgb(90, 89, 89);
  color: white;
  padding: 10px;
  pre {
    font-family: "Courier New", Courier, monospace;
    text-align: left;
    font-size: 1.1em;
    font: bolder;
  }
}
</style>
