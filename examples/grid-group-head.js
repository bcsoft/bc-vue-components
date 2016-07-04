define(["vue", "bc/vue/grid"], function (Vue) {
  "use strict";
  return new Vue({
    el: document.body,
    data: {
      singleChoice: false
    },
    methods: {
      dblclickRow: function (row, index) {
        console.log("dblclickRow: index=%d, row=%s", index, JSON.stringify(row));
      }
    }
  });
});