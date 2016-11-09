define(["vue", "bc/vue/search"], function (Vue) {
	"use strict";
	fetch("search-advance-config.json").then(function (res) {
		return res.ok ? res.json() : res.text().then(function (msg) { throw new Error(msg) });
	}).then(function (options) {
		var defaultAdvanceConfig = {
			height: "20em",
			options: options
		};
		return new Vue({
			el: document.body,
			data: {
				toggleAdvance: true,
				toggleHeightLimit: false,
				quick: false,
				align: 'left',
				advanceConfig: defaultAdvanceConfig,
				asyncAdvanceConfig: {
					height: "15em", 
					url: 'search-advance-config.json'
				},
				value: null,
				advanceValue: null,
				mixValue: null
			},
			watch: {
				toggleAdvance: function (value, old) {
					this.advanceConfig = value ? defaultAdvanceConfig : null;
				},
				toggleHeightLimit: function (value, old) {
					this.advanceConfig.height = value ? "20em" : "auto";
					console.log("h=%s", this.advanceConfig.height);
				}
			},
			methods: {
				search: function (value, advanceValue, mixValue) {
					console.log("[example] search value=%s, advanceValue=%s, mixValue=%s",
						value, JSON.stringify(advanceValue), JSON.stringify(mixValue));
				},
				change: function (value, advanceValue, mixValue) {
					console.log("[example] change value=%s, advanceValue=%s, mixValue=%s",
						value, JSON.stringify(advanceValue), JSON.stringify(mixValue));
				}
			}
		});
	});
});