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
			quick: false,
			align: 'left',
			advanceConfig: defaultAdvanceConfig,
			value: null,
			advanceValue: null,
			mixValue: null
		},
		watch: {
			toggleAdvance: function (value, old) {
				this.advanceConfig = value ? defaultAdvanceConfig : null;
			}
		},
		methods: {
			search: function (value, advanceValue, mixValue) {
				console.log("[example] search value=%s, advanceValue=%s, mixValue=%s", 
					value, JSON.stringify(advanceValue), JSON.stringify(mixValue));
			},
			change: function(value, advanceValue, mixValue){
				console.log("[example] change value=%s, advanceValue=%s, mixValue=%s", 
					value, JSON.stringify(advanceValue), JSON.stringify(mixValue));
			}
		}
	});
});