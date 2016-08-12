define(["vue", "bc/vue/toolbar", "bc/vue/button", "bc/vue/button-set", "bc/vue/search", "bc/vue/grid"], function (Vue) {
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
			c: {
				status: "0",
				searchValue: []
			},
			ui: {
				showBorder: false,
				quickSearch: false,
				toggleAdvance: true,
				conditions: defaultConditions
			}
		},
		watch: {
			'ui.toggleAdvance': function (checked) {
				this.ui.conditions = checked ? defaultConditions : null;
			}
		},
		computed: {
			// 混合视图中的各种条件：状态、搜索框
			pageCondition: function () {
				return JSON.stringify([].concat(
					this.c.searchValue	// 搜索组件的条件
					, { id: 'status', value: this.c.status, type: 'long', label: '状态' }) // 状态按钮组条件
				);
			}
		},
		methods: {
			clickCheck: function () {
				console.log("[example] 点击查看按钮");
			},
			// 状态按钮组改变时立即重新加载
			changeStatus: function (status) {
				console.log("[example] changeStatus: status=%s", JSON.stringify(status));
				this.reload();
			},
			// 搜索组件的条件改变时记下条件值
			changeCondition: function (value) {
				this.c.searchValue = value;
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
			// 导入数据
			importData: function () {
				console.log("[example] importData");
			}
		},
		ready: function () {
			// 加载视图数据
			this.reload();
		}
	});
});