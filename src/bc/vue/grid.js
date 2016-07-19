/**
 * grid 组件
 */
define(['jquery', 'vue', 'bc/vue/table-col', 'bc/vue/page-bar', 'text!bc/vue/grid.html', 'css!bc/vue/grid', 'bc/vue/loading'], function ($, Vue, tableCol, pageBar, template) {
	"use strict";
	var DEFAULT_PAGE_SIZES = [25, 50, 100];
	return Vue.component("bc-grid", {
		template: template,
		replace: true,
		components: {},
		props: {
			singleChoice: { type: Boolean, required: false, default: false, twoWay: true },	// 单选|多选
			columns: { type: Array, required: false, twoWay: true },
			rows: { type: Array, required: false, twoWay: true },
			url: { type: String, required: false, twoWay: true },

			// 搜索条件
			condition: { required: false, twoWay: true },

			// 分页条的参数
			showPageBar: { type: Boolean, required: false, default: true, twoWay: true },  // 是否显示分页条
			pageable: { type: Boolean, required: false, default: false, twoWay: true },    // 可分页
			pageNo: { type: Number, required: false, default: 1, twoWay: true },           // 当前页码
			pageSize: { type: Number, required: false, default: DEFAULT_PAGE_SIZES[0], twoWay: true },  // 当前页容量
			pageSizes: { type: Array, required: false, default: DEFAULT_PAGE_SIZES, twoWay: true },     // 可选页容量
			count: { type: Number, required: false, default: 0, twoWay: true },            // 总条目数

			refreshable: { type: Boolean, required: false, default: true, twoWay: true },  // 刷新
			exportable: { type: Boolean, required: false, default: false, twoWay: true },  // 导出
			importable: { type: Boolean, required: false, default: false, twoWay: true },  // 导入

			autoLoad: { type: Boolean, required: false, default: true, twoWay: true }   // 是否自动加载 url
		},
		computed: {
			selection: function () {
				if (this.singleChoice) {     // 单选
					for (var i = 0; i < this.rows.length; i++) {
						if (this.rows[i].selected) return this.rows[i];
					}
				} else {                     // 多选
					var ss = [];
					for (var i = 0; i < this.rows.length; i++) {
						if (this.rows[i].selected) ss.push(this.rows[i]);
					}
					return ss;
				}
			}
		},
		data: function () {
			return { v: { scrollLeft: 0, loading: false, selectAll: false } };
		},
		ready: function () {
			// 监听行事件
			var $el = $(this.$el);
			var vm = this;
			var delaying, timer, cancelClick;
			$el.on({
				"mouseover": function () {
					$(this).addClass("ui-state-hover");
				},
				"mouseout": function () {
					$(this).removeClass("ui-state-hover");
				},
				"click": function () {
					//console.log("click: rowIndex=%d, delaying=%s, cancelClick=%s, ts=%d", this.rowIndex, delaying, cancelClick, new Date().getTime());
					if (delaying) {
						clearTimeout(timer);
					}
					delaying = true;
					var rowIndex = this.rowIndex;
					timer = setTimeout(function () {
						delaying = false;
						if (cancelClick) {
							cancelClick = false;
							return;
						}
						//console.log("do click: rowIndex=%d, ts=%d", rowIndex, new Date().getTime());

						// 单选模式需要将其它选中的行进行反选
						if (vm.singleChoice) {
							for (var i = 0; i < vm.rows.length; i++) {
								if (i != rowIndex && vm.rows[i].selected) vm.rows[i].selected = false;
							}
						}

						// 切换行的选中状态
						var row = vm.rows[rowIndex];
						if (row.hasOwnProperty("selected")) {
							vm.rows[rowIndex].selected = !vm.rows[rowIndex].selected;
						} else {
							vm.$set("rows[" + rowIndex + "].selected", true);
						}
						delaying = false;

						// 发布单击行事件
						//vm.$dispatch("click-row", vm.rows[rowIndex], rowIndex);
					}, 200);
				},
				"dblclick": function () {
					//console.log("dblclick: rowIndex=%d, ts=%d", this.rowIndex, new Date().getTime());
					cancelClick = true;

					// 发布双击行事件
					vm.$dispatch("dblclick-row", vm.rows[this.rowIndex], this.rowIndex);
				}
			}, "tr.row");

			// 异步加载数据
			if (this.autoLoad) this.reload();
		},
		methods: {
			// 分页条变更页码时间
			changePageBar: function (type, pageNo, pageSize) {
				console.log("[grid] changePageBar: type=%s, pageNo=%d, pageSize=%d", type, pageNo, pageSize);
				this.reload();
			},
			// 重新加载数据
			reload: function () {
				if (!this.url) return;

				// 重置动画加载器
				this.v.loading = true;

				var params = {
					pageNo: this.pageNo,
					pageSize: this.pageSize
				};

				// 附加搜索条件
				if (this.condition) {
					if (typeof this.condition == "object") {
						Object.assign(params, this.condition);
					} else if (typeof this.condition == "string") {
						params.condition = this.condition;
					}
				}

				console.log("[grid] reload url=%s, params=%o", this.url, params);
				var vm = this;
				$.getJSON(this.url, params).then(function (j) {
					j.columns && vm.$set('columns', j.columns);
					j.rows && vm.$set('rows', j.rows);
					if (vm.pageable) { // 分页时
						j.pageNo && vm.$set('pageNo', j.pageNo);
						j.pageSize && vm.$set('pageSize', j.pageSize);
						j.pageSizes && vm.$set('pageSizes', j.pageSizes);
						j.count && vm.$set('count', j.count);
					}
					if (vm.showPageBar) {
						j.hasOwnProperty("refreshable") && vm.$set('refreshable', j.refreshable);
						j.hasOwnProperty("exportable") && vm.$set('exportable', j.exportable);
						j.hasOwnProperty("importable") && vm.$set('importable', j.importable);
					}
					j.hasOwnProperty("singleChoice") && vm.$set('singleChoice', j.singleChoice);
				}, function (error) {
					console.log("[grid] reload error: url=%s, error=%o", vm.url, error);
					alert("[grid] 数据加载失败！");
				}).always(function () {
					// 隐藏动画加载器
					vm.v.loading = false;
				});
			},
			isGroupColumn: function (column) {
				return !!(column.children && column.children.length);
			}
		},
		watch: {
			"v.selectAll": function (value, old) {
				var vm = this;
				this.rows.forEach(function (row, index) {
					if (row.hasOwnProperty("selected")) {
						row.selected = value;
					} else {
						vm.$set("rows[" + index + "].selected", value);
					}
				});
			}
		}
	});
});