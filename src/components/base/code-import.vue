<template>
  <div class="code-import">
    <mu-row>
      <h2>选择文件</h2>
      <mu-col span="12">
        <mu-text-field
          style="padding:20px;"
          type="file"
          ref="file"
          @change="onChange"
          full-width
          placeholder="选择源文件"
        ></mu-text-field>
      </mu-col>
    </mu-row>
    <mu-row style="margin-top:20px;">
      <h2>源代码</h2>
      <code-show :code="sourceCode" style="width:100%;" />
    </mu-row>
  </div>
</template>

<script>
var reader = new FileReader();
import codeShow from "@/components/base/code-show";
// import { KEYWORDS } from "@/complier/constant.js";
export default {
  name: "code-import",
  data() {
    return {
      sourceCode: ""
    };
  },
  components: {
    "code-show": codeShow
  },
  methods: {
    onChange() {
      let file = this.$refs["file"].$refs["input"].files[0];
      reader.readAsText(file);
      reader.onload = () => {
        this.sourceCode = reader.result;
        this.$store.commit("SAVE_CODE", this.sourceCode);
        this.$toast.success("导入成功!");
      };
    }
  }
};
</script>

<style lang="scss" scoped>
.code-import {
  padding: 10px;
  text-align: center;
}
</style>
