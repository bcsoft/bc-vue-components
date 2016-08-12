define(["vue", "bc/vue/search"], function (Vue) {
	"use strict";
	var defaultAdvanceConfig = [
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
			advanceConfig: defaultAdvanceConfig,
		},
		watch: {
			toggleAdvance: function (value, old) {
				this.conditions = value ? defaultAdvanceConfig : null;
			}
		},
		methods: {
			changeCondition: function (value) {
				console.log("[example] change-condition value=%s", typeof value == "object" ? JSON.stringify(value) : value);
			},
			search: function (value) {
				console.log("[example] search value=%s", typeof value == "object" ? JSON.stringify(value) : value);
			}
		}
	});
});