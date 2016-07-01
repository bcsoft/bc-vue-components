# [bc-vue-components](https://bitbucket.org/bctaxi/bc-vue-components)
BC 平台的 vue 组件

## 目录结构
```
src                                // 源代码
  └ bc
    └ vue
      ├ button.js
      ├ button-set.js
      ├ grid.js
      ├ ...
test
tools
  └ build.js                       // 项目构建的配置文件 (r.js)
lib-requirejs                      // requirejs 及其插件 (git submodule)
build                              // 项目构建的临时目录
dist                               // 发布目录
  ├ /bc/vue/components.js          // 最终版-无压缩
  └ /bc/vue/components.min.js      // 最终版-压缩
examples                           // demo
  └ index.html                     // demo 入口文件
.vscode
  └settings.json                   // vscode 用户配置文件
server.js                          // 演示用 HTTP 静态文件服务
```

## 项目构建
```
$ git clone git@bitbucket.org:bctaxi/bc-vue-components.git
$ cd bc-vue-components
$ npm install
$ r.js -o tools/build.js
$ cp build/bc/vue/components.js dist/bc/vue/components.js
文件 dist/bc/vue/components.js 就是要发布的最终版本
```

## 访问 demo: [http://127.0.0.1:3000/examples/index.html]
```
$ node server.js
```

## 备注
在 windows 命令行环境下请将 r.js 改为 r.js.cmd 或者使用 [DOSKEY]:(http://www.microsoft.com/resources/documentation/windows/xp/all/proddocs/en-us/doskey.mspx?mfr=true)
```
DOSKEY r.js=r.js.cmd $*
```