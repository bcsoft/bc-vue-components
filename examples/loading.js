define(["vue", "bc/vue/loading"], function (Vue) {
	"use strict";
	return new Vue({
		el: document.body,
		data: {
			size: 4.5,
			unit: "em",
			speed: 2000,
			maskable: true,
			countable: true
		}
	});
});