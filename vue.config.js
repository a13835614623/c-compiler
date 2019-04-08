module.exports = {
  publicPath: "./",
  // 全局引入scss
  css: {
    loaderOptions: {
      sass: {
        data: `
          @import "@/assets/css/index.scss";
        `
      }
    }
  }
};
