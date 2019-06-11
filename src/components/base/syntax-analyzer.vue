<template>
  <div class="syntax-analyzer">
    <mu-tabs :value.sync="activeTab">
      <mu-tab>SLR语法分析</mu-tab>
      <mu-tab>自定义LL(1)产生式分析</mu-tab>
    </mu-tabs>
    <div style="padding:10px;" v-if="activeTab == 1">
      <mu-row gutter v-for="(p, index) in myProducts" :key="index">
        <mu-col span="3">
          <mu-text-field
            placeholder="请输入产生式左部"
            v-model="p.left"
          ></mu-text-field>
        </mu-col>
        <mu-col span="2">
          <mu-icon value="remove"></mu-icon>
          <mu-icon value="remove"></mu-icon>
          <mu-icon value="remove"></mu-icon>
          <mu-icon value="remove"></mu-icon>
          <mu-icon value="remove"></mu-icon>
          <mu-icon value="chevron_right"></mu-icon>
        </mu-col>
        <mu-col span="6">
          <mu-text-field
            placeholder="请输入产生式右部(用空格分隔)"
            full-width
            v-model="p.right"
          ></mu-text-field>
        </mu-col>
        <mu-col span="1">
          <mu-button
            v-if="index == myProducts.length - 1"
            @click="onAddProduct"
            color="green"
          >
            <mu-icon value="add"></mu-icon>
          </mu-button>
          <mu-button v-else @click="onRemoveProduct(index)" color="red">
            <mu-icon value="remove"></mu-icon>
          </mu-button>
        </mu-col>
      </mu-row>
      <mu-row gutter>
        <mu-col span="3">
          <mu-text-field placeholder="开始符号" v-model="start"></mu-text-field>
        </mu-col>
        <mu-col span="9">
          <mu-text-field
            placeholder="待解析字符串(空格分隔)"
            v-model="input"
            full-width
          ></mu-text-field>
        </mu-col>
      </mu-row>
      <mu-row gutter>
        <mu-col span="4">
          <mu-button @click="onParse2" color="green">语法分析</mu-button>
        </mu-col>
        <mu-col span="4">
          <mu-button @click="openFullscreenDialog" color="blue"
            >查看语法树</mu-button
          >
        </mu-col>
        <mu-col span="4">
          <mu-button @click="onReset" color="red">重置</mu-button>
        </mu-col>
      </mu-row>
      <div style="margin:10px;">
        <mu-data-table
          :columns="columns"
          no-data-text="暂无token"
          stripe
          border
          :data="infos2"
        >
          <template slot-scope="scope">
            <td>{{ scope.$index + 1 }}</td>
            <td>{{ scope.row.stack }}</td>
            <td>{{ scope.row.input }}</td>
            <td>{{ scope.row.product }}</td>
          </template>
        </mu-data-table>
      </div>
    </div>
    <div v-else>
      <mu-row style="margin:10px;">
        <mu-col span="6">
          <mu-button color="green" @click="onParse">语法解析</mu-button>
        </mu-col>
        <mu-col span="6">
          <mu-button
            color="blue"
            :disabled="!isParsed"
            @click="openFullscreenDialog"
            >查看语法树</mu-button
          >
        </mu-col>
      </mu-row>
      <mu-data-table
        :columns="columns"
        no-data-text="暂无token"
        stripe
        border
        :data="infos"
      >
        <template slot-scope="scope">
          <td>{{ scope.$index + 1 }}</td>
          <td>{{ scope.row.stack }}</td>
          <td>{{ scope.row.input }}</td>
          <td>{{ scope.row.remark }}</td>
        </template>
      </mu-data-table>
    </div>
    <mu-dialog
      width="360"
      transition="slide-bottom"
      fullscreen
      :open.sync="openFullscreen"
    >
      <mu-appbar color="primary" title="语法树">
        <mu-button slot="left" icon @click="closeFullscreenDialog">
          <mu-icon value="close"></mu-icon>
        </mu-button>
        <mu-button slot="right" flat @click="closeFullscreenDialog">
          关闭
        </mu-button>
      </mu-appbar>
      <div style="padding: 24px;">
        <tree-view v-if="dataSet" :data-set="dataSet" />
      </div>
    </mu-dialog>
  </div>
</template>

<script>
import AnalyzerString from "@/compiler/syntax-analyzer-string";
import LRAnalyzer from "@/compiler/syntax-analyzer-LR";
import Token from "@/compiler/po/Token";
import Product from "@/compiler/po/Product";
import treeView from "./tree-view";
import { NIL, EOF, Products } from "@/compiler/constant";
const PRODUCT_1 = Products;
const PRODUCT_2 = [
  new Product("E", ["T", "E'"]),
  new Product("E'", ["+", "T", "E'"]),
  new Product("E'", [NIL]),
  new Product("T", ["F", "T'"]),
  new Product("T'", ["*", "F", "T'"]),
  new Product("T'", [NIL]),
  new Product("F", ["(", "E", ")"]),
  new Product("F", ["id"])
];
// let analyzer = new Analyzer("PROGRAM", Products);
// let dataset = analyzer.parse(["id", "+", "id", "*", "id"]);
export default {
  name: "syntax-analyzer",
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
          title: "分析栈",
          name: "stack",
          align: "center",
          cellAlign: "center",
          sortable: true
        },
        {
          title: "输入缓冲区",
          name: "input",
          align: "center",
          cellAlign: "center",
          sortable: true
        },
        {
          title: "产生式",
          name: "product",
          align: "center",
          cellAlign: "center",
          sortable: true
        }
      ],
      dataSet: null,
      // 语法树对话框打开状态
      openFullscreen: false,
      isParsed: false,
      input: "",
      start: "",
      myProducts: [
        {
          left: "",
          right: ""
        }
      ],
      activeTab: 0,
      infos: [],
      infos2: [],
      analyzer: null
    };
  },
  created() {
    const loading = this.$loading({ text: "正在初始化SLR分析表,请稍等..." });
    this.products2MyProducts();
    setTimeout(() => {
      this.analyzer = new LRAnalyzer(
        PRODUCT_1[1].left,
        PRODUCT_1,
        this.$store.state.symbols
      );
      loading.close();
    }, 200);
  },
  methods: {
    openFullscreenDialog() {
      this.openFullscreen = true;
    },
    closeFullscreenDialog() {
      this.openFullscreen = false;
    },
    // 添加产生式
    onAddProduct() {
      if (this.myProducts.length == 10) {
        this.$toast.error("产生式不能超过10个!");
        return;
      }
      this.myProducts.push({ left: "", right: "" });
    },
    // 移除产生式
    onRemoveProduct(index) {
      this.myProducts.splice(index, 1);
    },
    onParse() {
      try {
        console.log(this.$store.state);
        let { tree, infos } = this.analyzer.parse(this.$store.state.tokens);
        this.infos = infos;
        this.$store.commit("SAVE_TREE", tree);
        this.dataSet = tree;
        this.isParsed = true;
      } catch (error) {
        console.error(error);
        this.$toast.error(error.message);
      }
    },
    // 解析自定义产生式
    onParse2() {
      try {
        let analyzer = new AnalyzerString(
          this.myProducts[0].left,
          this.myProducts.map(p => {
            return new Product(p.left, p.right.split(" "));
          })
        );
        let { tree, infos } = analyzer.parse(this.input.split(" "));
        this.dataSet = tree;
        this.infos2 = infos;
        this.isParsed = true;
      } catch (error) {
        console.error(error);
        this.$toast.error(error.message);
      }
    },
    products2MyProducts() {
      this.myProducts = [];
      PRODUCT_2.map(p => {
        this.myProducts.push({
          left: p.left,
          right: p.right
            .reduce((pre, cur) => {
              return pre + " " + cur;
            })
            .trim()
        });
      });
      this.start = PRODUCT_2[0].left;
      this.input = ["id", "+", "id", "*", "id"].reduce((pre, cur) => {
        return pre + " " + cur;
      });
    },
    onReset() {
      this.myProducts = [
        {
          left: "",
          right: ""
        }
      ];
      (this.input = ""), (this.start = ""), (this.dataSet = null);
    }
  },
  components: {
    "tree-view": treeView
  }
};
</script>

<style lang="scss" scoped>
.syntax-analyzer {
  padding: 0;
  text-align: center;
  min-height: 100vh;
}
</style>
