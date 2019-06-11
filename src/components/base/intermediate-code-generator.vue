<template>
  <div class="intermediate-code-generator">
    <mu-container style="margin:20px;">
      <mu-button color="primary" @click="onGenerateMidCode"
        >生成中间代码</mu-button
      >
    </mu-container>
    <mu-row>
      <mu-col span="6">
        <!--  -->
        <h2>源代码</h2>
        <!-- 源代码 -->
        <code-show
          :code="$store.state.sourceCode"
          class="code"
          :style="'height:' + midCodeHeight + 'px;'"
        />
      </mu-col>
      <mu-col span="6">
        <h2>中间代码</h2>
        <!-- 中间代码 -->
        <code-show
          :code="midCode"
          class="code"
          empty="暂未生成中间代码"
          @update:height="onUpdateHeight"
        />
      </mu-col>
    </mu-row>
    <h2>中间代码生成过程</h2>
    <mu-data-table
      :columns="columns"
      no-data-text="暂未生成中间代码"
      stripe
      border
      :data="codes"
    >
      <template slot-scope="scope">
        <td>{{ scope.$index + 1 }}</td>
        <td>{{ scope.row.product }}</td>
        <td>{{ scope.row.code }}</td>
      </template>
    </mu-data-table>
  </div>
</template>

<script>
import codeShow from "@/components/base/code-show";
import CodeGenerator from "@/compiler/mid-code-generator";
export default {
  name: "intermediate-code-generator",
  data() {
    return {
      // 表格列
      columns: [
        {
          title: "序号",
          width: 80,
          name: "index",
          cellAlign: "center",
          align: "center"
        },
        {
          title: "规约所使用产生式",
          name: "stack",
          align: "center",
          cellAlign: "product"
        },
        {
          title: "三地址码",
          name: "input",
          align: "center",
          cellAlign: "code"
        }
      ],
      midCode: "",
      codes: [],
      midCodeHeight: 0
    };
  },
  components: {
    "code-show": codeShow
  },
  methods: {
    onUpdateHeight(height) {
      this.midCodeHeight = height;
    },
    onGenerateMidCode() {
      let codeGenerator = new CodeGenerator(this.$store.state.tree);
      this.codes = codeGenerator.generator();
      this.midCode = this.codes[this.codes.length - 1].code;
    }
  }
};
</script>

<style lang="scss" scoped>
.intermediate-code-generator {
  padding: 0;
  text-align: center;
  min-height: 100vh;
  .code {
    border: 1px solid white;
    margin-bottom: 10px;
  }
}
</style>
