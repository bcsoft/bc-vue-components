define(["jquery", "vue", "bc/vue/button-set"], function ($, Vue) {
  "use strict";
  return new Vue({
    el: document.body,
    methods: {
      change: function (item, old) {
        var msg = "new=" + JSON.stringify(item) + ", old=" + JSON.stringify(old);
        $("#debug").text(msg);
        console.log("change item=%s, old=%s", JSON.stringify(item), JSON.stringify(old));
      }
    }
  });
});