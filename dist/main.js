/* requirejs 全局配置 */
require.config({
  baseUrl: "./",
  paths: {
    // requirejs and plugins
    "domReady": "../bower_components/domReady/domReady",
    "text": "../bower_components/text/text",
    "css": "../bower_components/require-css/css.min",
    "css-builder": '../bower_components/require-css/css-builder',
    "normalize": '../bower_components/require-css/normalize',

    // vue: http://vuejs.org
    "vue": "../bower_components/vue/dist/vue.min",

    // jquery and plugins
    "jquery": "../bower_components/jquery/jquery.min",

    // jquery-ui and plugins
    "jquery-ui": "../bower_components/jquery-ui/jquery-ui.min",
    "jquery-ui-css": "../bower_components/jquery-ui/themes/base/minified/jquery-ui.min",

    // demo
    "bc-css": "../examples/bc",
    "demo-css": "../examples/demo",
  },
  shim: {
    "jquery-ui": ["jquery", "css!jquery-ui-css"],
    "css!demo-css": ["css!bc-css", "css!jquery-ui-css"]
  },
  waitSeconds: 10
});

require(demos || [], function () {
  console.log("init deps: %s", (demos || []).toString());
});