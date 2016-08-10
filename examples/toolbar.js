define(["vue", "bc/vue/toolbar", "bc/vue/button", "bc/vue/button-set", "bc/vue/search"], function (Vue) {
	"use strict";
	var vm = new Vue({
		el: document.body,
		data: {
			conditions: [
				{ id: 'str', label: '文本', default: true },
				{ id: 'date', type: 'date', label: '日期', default: true, value: '111' },
				{ id: 'num', type: 'number', label: '数字' },
				{ id: 'money', type: 'money', label: '金额' }
			]
		},
		watch: {},
		methods: {
			clickCheck: function () {
				console.log("clickCheck");
			},
			changeStatus: function (status, old) {
				console.log("changeStatus: new=%s, old=%s", JSON.stringify(status), JSON.stringify(old));
			},
			search: function (value) {
				console.log("search: value=%s", JSON.stringify(value));
			}
		}
	});

	return vm;
});