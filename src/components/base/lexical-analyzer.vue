<template>
  <div class="lexical-analyzer">
    <h2>词法分析选项</h2>
    <mu-row gutter style="margin:10px;">
      <mu-col span="3">
        <mu-button color="success" @click="onPreprocessor"
          >代码预处理</mu-button
        >
      </mu-col>
      <mu-col span="3">
        <mu-button :disabled="!isPreprocessed" color="error" @click="onParseAll"
          >解析全部</mu-button
        >
      </mu-col>
      <mu-col span="3">
        <mu-button
          :disabled="!isPreprocessed"
          color="primary"
          @click="onNextToken"
          >解析下一个token</mu-button
        >
      </mu-col>
      <mu-col span="3">
        <mu-button :disabled="!isPreprocessed" color="indigo" @click="onReset"
          >重置解析结果</mu-button
        >
      </mu-col>
    </mu-row>
    <h2>符号表</h2>
    <h2 style="text-align:center;" v-if="!symbols[0]" class="caption">
      暂无符号生成
    </h2>
    <mu-row>
      <mu-chip
        style="margin:10px;"
        v-for="(symbol, index) in symbols"
        :key="index"
        :color="randomColor()"
      >
        {{ index }}<br />{{ symbol }}
      </mu-chip>
    </mu-row>
    <mu-row>
      <mu-col span="6">
        <h2>源代码</h2>
        <code-show
          ref="codeShow"
          @update:height="onUpdateHeight"
          :code="code"
        />
      </mu-col>
      <mu-col span="5" offset="1">
        <h2>token表</h2>
        <mu-data-table
          :height="codeHeight"
          style="width:450px;"
          :columns="columns"
          no-data-text="暂无token"
          stripe
          border
          :data="tokens"
        >
          <template slot-scope="scope">
            <td>{{ scope.$index + 1 }}</td>
            <td>
              {{
                TOKEN_TAG[scope.row.type]
                  ? TOKEN_TAG[scope.row.type]
                  : scope.row.type
              }}
            </td>
            <td>{{ scope.row.description }}</td>
          </template>
        </mu-data-table>
      </mu-col>
    </mu-row>
  </div>
</template>

<script>
import { TOKEN_TAG } from "@/compiler/constant.js";
import Lexer from "@/compiler/lexer.js";
import preprocessor from "@/compiler/preprocessor.js";
// let Lexer = require("@/compiler/lexer.js");
// let { TOKEN_TAG } = require("@/compiler/constant.js");
// let preprocessor = require("@/compiler/preprocessor.js");
import codeShow from "@/components/base/code-show";
var lexer;
export default {
  name: "lexical-analyzer",
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
          title: "token类型",
          name: "name",
          width: 150,
          align: "center",
          cellAlign: "center",
          sortable: true
        },
        {
          title: "token描述",
          name: "description",
          width: 218,
          align: "center",
          cellAlign: "center",
          sortable: true
        }
      ],
      // token数组
      tokens: [],
      // 符号表
      symbols: [],
      codeHeight: 500,
      // 代码是否经过预处理
      isPreprocessed: false,
      TOKEN_TAG
    };
  },
  components: {
    "code-show": codeShow
  },
  computed: {
    code() {
      return this.$store.state.sourceCode;
    }
  },
  methods: {
    // 重置解析结果
    onReset() {
      this.symbols = [];
      this.tokens = [];
      lexer = null;
    },
    // 解析全部
    onParseAll() {
      this.parseToken("parseAll");
    },
    // 解析下一个token
    onNextToken() {
      this.parseToken("nextToken");
    },
    /**
     * 解析token
     * @param {String} functionName 方法名
     */
    parseToken(functionName) {
      try {
        if (!lexer) lexer = new Lexer(this.code);
        let tokens = lexer[functionName]();
        this.symbols = lexer.symbols;
        if (tokens) {
          this.tokens = this.tokens.concat(tokens);
          console.log("tokens:", this.tokens);
          this.$store.commit("SAVE_TOKENS", this.tokens);
          this.$store.commit("SAVE_SYMBOLS", this.symbols);
          this.$toast.success("解析成功!");
        }
      } catch (error) {
        console.error(error);
        this.$toast.error(error.message);
      }
    },
    // 代码预处理
    onPreprocessor() {
      if (!this.code || this.code.length == 0) {
        this.$toast.error("源代码不能为空!");
        return;
      }
      this.$store.commit("SAVE_CODE", preprocessor(this.code));
      this.isPreprocessed = true;
      this.$toast.success("预处理成功!");
    },
    onUpdateHeight(height) {
      this.codeHeight = height;
    },
    randomColor() {
      let colors = [
        "info",
        "primary",
        "success",
        "error",
        "warning",
        "secondary"
      ];
      return colors[parseInt(Math.random() * colors.length)];
    }
  }
};
</script>

<style lang="scss">
.lexical-analyzer {
  padding-bottom: 20px;
}
</style>
