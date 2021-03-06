define(["vue", "bc/vue/page-bar"], function (Vue) {
	"use strict";
	return new Vue({
		el: document.body,
		data: {},
		ready: function () {
			this.$on("change", function (type, pageNo, pageSize) {
				console.log("[example] change: type=%s, pageNo=%d, pageSize=%d", type, pageNo, pageSize);
			});
			this.$on("export", function (scope) {
				console.log("[example] export: scope=%s", scope);
			});
			this.$on("import", function () {
				console.log("[example] import");
			});
		}
	});
});