define(["vue", "bc/vue/table-col"], function (Vue) {
  "use strict";
  return new Vue({
    el: document.body,
    data: {
      // 表头
      columns: [
        { key: "name", label: "姓名", width: "150px" },
        { key: "age", label: "年龄", width: "100px" },
        { key: "sex", label: "性别", width: "50px" }
      ]
    }
  });
});