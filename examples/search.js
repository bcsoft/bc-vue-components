define(["vue", "bc/vue/search"], function (Vue) {
	"use strict";
	return new Vue({
		el: document.body,
		data: {
			advanced: true,
			quickSearch: false
		},
		methods: {
			change: function (keys, old) {
				console.log("change keys=%s, old=%s", keys, old);
			},
			search: function (keys) {
				console.log("search keys=%s", keys);
			}
		}
	});
});