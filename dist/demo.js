define(["vue", "bc/vue/components"], function (Vue, t, b) {
  "use strict";
  return new Vue({
    el: document.body,
    data: {
      searchText: "",
      showBorder: false,
      quickSearch: false
    },
    methods: {
      clickCheck: function () {
        console.log("clickCheck");
      },
      changeStatus: function (status, old) {
        console.log("changeStatus: new=%s, old=%s", JSON.stringify(status), JSON.stringify(old));
      },
      search: function (text) {
        console.log("search: text=%s", text);
        this.$refs.grid.reload();
      },
      export: function (scope) {
        console.log("[Grid] export: scope=%s", scope);
      },
      import: function () {
        console.log("[Grid] import");
      }
    }
  });
});