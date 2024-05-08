/**
 * grid 组件
 */
define([
	'vue', 'bc/vue/cors', 'bc/vue/table-col', 'bc/vue/page-bar',
	'text!bc/vue/grid.html', 'css!bc/vue/grid', 'bc/vue/loading'
], function (Vue, CORS, tableCol, pageBar, template) {
	"use strict";
	var exportForm;
	var DEFAULT_PAGE_SIZES = [25, 50, 100];

	return Vue.component("bc-grid", {
		template: template,
		replace: true,
		props: {
			singleChoice: { type: Boolean, required: false, default: false },	// 单选|多选
			columns: { type: Array, required: false, default: function () { return [] } },
			rows: { type: Array, required: false, default: function () { return [] } },
			url: { type: String, required: false },
			rowStyle: { type: Function, required: false },  // 数据行的样式渲染，第 1 个参数为行数据对象

			// 附加的查询条件
			query: { required: false },
			queryKey: { type: String, required: false, default: "query" },   // get 请求时的参数名称

			// 请求方法：默认为 'GET'
			method: { type: [String, Function], required: false },
			// 重新加载数据前允许用户预处理请求参数和取消请求的处理函数，返回 false 则取消重新加载数据
			beforeReload: { type: Function, required: false },
			// 加载数据失败后的回调函数，其第一个参数 reason 的值是服务器返回的数据：
			// 1. 如果响应状态码为 204，其值为 null；
			// 2. 如果响应类型为 text/*，其为 body 的原始文本值；
			// 3. 否则其值是默认将 body 视为 json 格式解析为的 json 对象。
			error: { type: Function, required: false },

			// 分页条的参数
			showPageBar: { type: Boolean, required: false, default: true },  // 是否显示分页条
			pageable: { type: Boolean, required: false, default: false },    // 可分页
			pageNo: { type: Number, required: false },           // 当前页码
			pageSize: { type: Number, required: false },  // 当前页容量
			pageSizes: { type: Array, required: false, default: function () { return DEFAULT_PAGE_SIZES } },     // 可选页容量
			count: { type: Number, required: false, default: 0 },            // 总条目数

			refreshable: { type: Boolean, required: false, default: true },  // 刷新
			exportable: { type: Boolean, required: false, default: false },  // 导出
			importable: { type: Boolean, required: false, default: false },  // 导入

			cellFilter: { type: Function, required: false },  // 单元格值的过滤函数，用于格式化单元格的值
			autoLoad: { type: Boolean, required: false, default: true }   // 是否自动加载 url
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
			},
			headRowspan: function () {
				return this.$refs.cols ? this.$refs.cols.rowspan : 1;
			}
		},
		data: function () {
			return { v: { scrollLeft: 0, loading: false, selectAll: false } };
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
				this.reload();
			},
			// 重新加载数据
			reload: function () {
				if (!this.url) return;

				// 重置动画加载器
				this.v.loading = true;

				var params = {};
				if (this.pageable) {
					if (this.pageNo) params.pageNo = this.pageNo;
					if (this.pageSize) params.pageSize = this.pageSize;
				}

				// 附加搜索条件
				if (this.query) {
					if (Array.isArray(this.query)) {               // 数组
						params[this.queryKey] = JSON.stringify(this.query);
					} else if (typeof this.query == "object") {    // json 对象
						var q = this.query;
						Object.keys(q).forEach(function (key) {
							var v = q[key], t = typeof (v);
							if (v !== null && v !== "" && t !== "undefined")
								params[key] = v;
						});
					} else if (typeof this.query == "string") {    // 字符
						params[this.queryKey] = this.query;
					}
				}

				//console.log("[grid] reload url=%s, params=%s", this.url, JSON.stringify(params));
				var vm = this;
				var url = this.url;
				var settings = {
					method: typeof (this.method) == "function" ? this.method() : (this.method || "GET")
				};

				// 处理请求提交的参数
				if (settings.method == "POST") {
					settings.headers = { "Content-Type": "application/json;charset=utf-8" }; // 默认UTF-8
					settings.body = JSON.stringify(params); // post json
				} else if (settings.method == "GET") {
					// 将参数附加到url后面
					var s = [];
					Object.keys(params).forEach(function (key) {
						s.push(key + "=" + params[key]);
					});
					if (s.length) url += "?" + s.join("&");
				}

				// 重新加载前允许用户预处理请求参数和取消请求
				if (this.beforeReload && this.beforeReload(settings) === false) {
					vm.v.loading = false;
					return;
				}

				// 开始重新加载
				fetch(url, CORS.autoCorsSettings(url, settings)).then(res => {
					if (res.status === 204) return null;
					let bodyContent = res.headers.get('Content-Type').startsWith('text/') ? res.text() : res.json() // 默认 json
					return res.ok ? bodyContent : bodyContent.then(reason => {
						throw new Error(reason);
					});
				}).then(j => {
					if (Array.isArray(j)) { // 非分页且直接返回 rows 值的情况
						vm.$set('rows', j);
					} else {
						j.hasOwnProperty("columns") && vm.$set('columns', j.columns);
						j.hasOwnProperty("rows") && vm.$set('rows', j.rows);
						if (vm.pageable) { // 分页时
							j.hasOwnProperty("pageNo") && vm.$set('pageNo', j.pageNo);
							j.hasOwnProperty("pageSize") && vm.$set('pageSize', j.pageSize);
							j.hasOwnProperty("pageSizes") && vm.$set('pageSizes', j.pageSizes);
							j.hasOwnProperty("count") && vm.$set('count', j.count);
						}
						if (vm.showPageBar) {
							j.hasOwnProperty("refreshable") && vm.$set('refreshable', j.refreshable);
							j.hasOwnProperty("exportable") && vm.$set('exportable', j.exportable);
							j.hasOwnProperty("importable") && vm.$set('importable', j.importable);
						}
						j.hasOwnProperty("singleChoice") && vm.$set('singleChoice', j.singleChoice);
					}

					// 触发数据加载完毕事件
					vm.$dispatch('after-reload', j);

					// 隐藏动画加载器
					vm.v.loading = false;
				}).catch(reason => {
					console.log("[grid] reload error: url=%s, reason=%o", vm.url, reason);

					// 隐藏动画加载器
					vm.v.loading = false;

					let showErrorMsg = true;

					// 调用错误回调函数
					if (typeof this.error === 'function')  showErrorMsg = this.error(reason.message) !== false;

					// 显示错误提示信息
					if (showErrorMsg) {
						var msg = reason.message || "[grid] 数据加载失败！";
						if (window['bc'] && bc.msg) bc.msg.alert(msg);
						else alert(msg);
					}
				});
			},
			isGroupColumn: function (column) {
				return !!(column.children && column.children.length);
			},
			/** 单元格值的格式化 */
			rowCellFilter: function (value, row, column) {
				//console.log("value=%s, column=%s", value, column.id);
				if (!column.filter) return value;
				else if (typeof column.filter == "string") { // vue 过滤器
					var cfg = column.filter.split(" ");
					var filter = Vue.filter(cfg[0]); 	// 过滤器ID
					if (!filter) console.error("filter '%s' not found (column=%s)", cfg[0], column.id);
					var args = cfg.slice(1);
					args.unshift(value); 					// 过滤器参数
					//console.log("column=%s, filter=%s, args=%o", column.id, cfg[0], args);
					return filter.apply(this, args);
				} else if (typeof column.filter == "function") { // 自定义的渲染函数
					return column.filter.apply(this, [value, row, column]);
				}
			},
			/** 单元格的鼠标提示信息 */
			rowCellTitle: function (value, row, column) {
				if (!column.title) return;
				if (typeof column.title == "function") { // 自定义函数
					return column.title(value, row, column);
				} else return value;
			},
			/** 单元格点击函数 */
			rowCellClick: function (value, row, column, e) {
				if (column.rowCellClick) column.rowCellClick.apply(this, [value, row, column, e]);
			},
			// 获取用于导出报表的 form (如果没有会自动创建一个)
			getExportForm: function () {
				if (!exportForm)
					exportForm = $('<form name="bc-vue-grid-exporter" method="get" style="display:none"></form>')[0];
				return exportForm;
			}
		}
	});
});