/* requirejs 全局配置 */
require.config({
  baseUrl: "../src",
  paths: {
    // requirejs and plugins
    "domReady": "../bower_components/domReady/domReady",
    "text": "../bower_components/text/text",
    "css": "../bower_components/require-css/css.min",
    "css-builder": '../bower_components/require-css/css-builder',
    "normalize": '../bower_components/require-css/normalize',

    // vue: http://vuejs.org
    "vue": "../bower_components/vue/dist/vue",

    // jquery and plugins
    "jquery": "../bower_components/jquery/jquery.min",

    // jquery-ui and plugins
    "jquery-ui": "../bower_components/jquery-ui/jquery-ui.min",
    "jquery-ui-css": "../bower_components/jquery-ui/themes/base/minified/jquery-ui.min",

    // demo
    "bc-css": "../examples/bc",
    "demo-css": "../examples/demo",

    // dist
    //"bc/vue/components": "../dist/bc-vue-components"
    //"bc-vue-components": "../dist/bc-vue-components"
  },
  shim: {
    "jquery-ui": ["jquery", "css!jquery-ui-css"],
    "css!demo-css": ["css!bc-css", "css!jquery-ui-css"]
  },
  waitSeconds: 10
});

