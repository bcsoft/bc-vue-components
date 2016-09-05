# [bc-vue-components](https://bitbucket.org/bctaxi/bc-vue-components)
BC 平台的 vue 组件

## 目录结构
```
src                                // 源代码
  └ bc
    └ vue
      ├ components.js              // 全部组件
      ├ toolbar.js                 // 工具条
      ├ button.js                  // 按钮
      ├ grid.js                    // 网格
      ├ search.js                  // 搜索
      ├ ...
tools
  ├ build.js                       // 项目构建的配置文件 (r.js)
  ├ build.sh                       // 项目构建脚本
  ├ main.js                        // requirejs 全局配置
  └ start.sh                       // 一键运行脚本
dist                               // 发布目录
  ├ /bc/vue/components.js          // 最终版-无压缩
  ├ /bc/vue/components.min.js      // 最终版-压缩
  └ demo.html                      // 最终版 demo 入口文件
examples
  └ index.html                     // 开发版 demo 入口文件
.vscode
  └settings.json                   // vscode 用户配置文件
server.js                          // 演示用 HTTP 静态文件服务
bower.json                         // bower 配置文件
package.json                       // nodejs 配置文件
CHANGELOG.md                       // 项目变更日志
```

## 开发环境配置
1. 安装 [nodejs v6+](https://nodejs.org)
2. 安装 [vscode](https://code.visualstudio.com)

## 项目初始化、构建、运行 Demo - 自动
```
$ ./tools/start.sh
```

## 项目初始化、构建、运行 Demo - 手动
```
$ git clone https://github.com/bcsoft/bc-vue-components.git
$ cd bc-vue-components
$ npm install
$ npm install -g bower
$ bower install
$ r.js -o tools\build.js
$ mkdir -p dist\bc\vue
$ cp temp\bc\vue\components.js dist\bc\vue\components.js
$ node server.js
```
注：文件 dist\bc\vue\components.js 是最终发布版本

## 访问 [demo](http://127.0.0.1:3000/examples/index.html)

## 备注
在 windows 命令行环境下可以用 [DOSKEY](http://www.microsoft.com/resources/documentation/windows/xp/all/proddocs/en-us/doskey.mspx?mfr=true)
 将 r.js.cmd 改为 r.js : 
```
DOSKEY r.js=r.js.cmd $*
```