define(["vue", "bc/vue/search"], function (Vue) {
	"use strict";
	var defaultConditions = [
		{ id: 'str', label: '文本' },
		{ id: 'date', type: 'date', label: '日期', default: true, value: '111' },
		{ id: 'num', type: 'number', label: '数字' },
		{ id: 'money', type: 'money', label: '金额', default: true }
	];
	return new Vue({
		el: document.body,
		data: {
			toggleAdvance: true,
			quickSearch: false,
			align: 'left',
			conditions: defaultConditions,
		},
		watch: {
			toggleAdvance: function (value, old) {
				this.conditions = value ? defaultConditions : null;
			}
		},
		methods: {
			change: function (value) {
				console.log("searchExample change-condition value=%s", JSON.stringify(value));
			},
			search: function (value) {
				console.log("searchExample search value=%s", JSON.stringify(value));
			}
		}
	});
});