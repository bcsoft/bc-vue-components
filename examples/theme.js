define(["vue", "bc/vue/theme"], function (Vue) {
	"use strict";
	return new Vue({
		el: document.body,
		data: {
		},
		methods: {
			change: function (size, unit) {
				console.log("[example] change font-size=%s%s", size, unit);
			}
		}
	});
});