define(["vue", "bc/vue/components"], function (Vue, t, b) {
  "use strict"; 
  return new Vue({
    el: document.body,
    data: {},
    watch: {},
    methods: {
      clickCheck: function () {
        console.log("clickCheck");
      },
      changeStatus: function (status, old) {
        console.log("changeStatus: new=%s, old=%s", JSON.stringify(status), JSON.stringify(old));
      },
      search: function (text) {
        console.log("search: text=%s", text);
      }
    }
  });
});