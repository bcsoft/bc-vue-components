define(["vue", "bc/vue/toolbar", "bc/vue/button", "bc/vue/button-set", "bc/vue/search", "bc/vue/grid"], function (Vue) {
	"use strict";
	var defaultAdvanceConfig = [
		{ id: 'str', label: '文本' },
		{ id: 'date', type: 'date', label: '日期', default: true, value: '2016-01-01', operator: '>=' },
		{ id: 'num', type: 'number', label: '数字' },
		{ id: 'money', type: 'money', label: '金额', default: true }
	];

	return new Vue({
		el: document.body,
		data: {
			url: "/data/grid.json",
			status: "0",
			mixSearch: null,
			ui: {
				showBorder: false,
				quickSearch: false,
				singleChoice: false,
				toggleAdvance: true,
				corsChoice: false,
				advanceConfig: {
					height: "40em",
					url: "search-advance-config.json"
				}
			}
		},
		watch: {
			'ui.toggleAdvance': function (checked) {
				this.ui.advanceConfig = checked ? defaultAdvanceConfig : null;
			},
			'ui.corsChoice': function (checked) {
				this.url = (checked ? "http://127.0.0.1:9000" : "") + "/data/grid.json";
				if (window && window.localStorage) {
					if (checked) window.localStorage.authorization = "Beara test-jwt";
					else window.localStorage.removeItem("authorization");
				}
			}
		},
		computed: {
			// 混合视图中的各种条件：状态、搜索框
			// [[name, value, type, operator],...]
			condition: function () {
				var c = [];

				// 状态按钮组的值
				c.push(['status', this.status, 'long']);

				// 搜索组件的值
				if (this.mixSearch) c = c.concat(this.mixSearch);

				return c;
			}
		},
		methods: {
			open: function () {
				console.log("[example] open");
			},
			// 状态按钮组改变时立即重新加载
			changeStatus: function (status) {
				console.log("[example] changeStatus: status=%s", JSON.stringify(status));
				this.reload();
			},
			// 点击搜索组件的搜索图标事件
			search: function (value) {
				this.reload();
			},
			// 重新加载视图数据
			reload: function () {
				this.$nextTick(function () {
					this.$refs.grid.reload();
				})
			},
			// 导出数据
			exportData: function (scope) {
				console.log("[example] exportData: scope=%s", scope);
			},
			// 导入数据后
			imported: function (success, result) {
				console.log("[example] imported: success=%s, result=%o", success, result);
			},
			// 错误回调函数
			// 返回 false 可以禁止 grid 内部的异常信息显示机制
			error: function (reason) {
				alert("reason=" + reason);
				return false;
			}
		},
		ready: function () {
			// 加载视图数据
			this.reload();
		}
	});
});