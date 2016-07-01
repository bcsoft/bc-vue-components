define(["vue", "bc/vue/button"], function (Vue) {
  "use strict";
  return new Vue({
    el: document.body,
    data: {
      text: "新建"
    },
    methods: {
      myClick: function () {
        console.log("myClick");
      }
    }
  });
});