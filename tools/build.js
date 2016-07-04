({
  appDir: "../src",
  baseUrl: './',
  mainConfigFile: "../tools/main.js",
  dir: "../temp",
  paths: {
  },
  modules: [
    // 所有组件打包
    {
      name: "bc/vue/components",
      exclude: [
        "domReady",     // 排除 domReady 插件源码
        "text",         // 排除 text 插件源码
        "css",          // 排除 css 插件源码
        "jquery",       // 排除 jquery 源码
        "vue",          // 排除 vue 源码
      ]
    }
  ],

  // 优化 js 文件，uglify|none 默认 uglify
  optimize: "uglify",
  uglify: {
    output: {
      beautify: true   // 显示美化
    },
    mangle: false      // 变量混淆
  },

  // 内联 text! 依赖的文本文件内容
  inlineText: true,

  // 压缩 css 文件内容
  optimizeCss: "standard",

  // 删除已合并的文件
  removeCombined: true,

  fileExclusionRegExp: /bower_components/,
  keepBuildDir: false
})