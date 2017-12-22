/**
 * 分页条的导入组件
 * <pre>
 *   UI 使用：
 *   <bc-page-bar-exporter [url="..."] [max="3500"]/>
 * 
 *   参数说明：
 *   <ul>
 *     <li>url {String} [可选] 导出使用的 URL</li>
 *     <li>title {String} [可选] 按钮的鼠标提示文字，默认为 “导出”</li>
 *     <li>iconClass {String} [可选] 按钮的图标样式，默认为 “ui-icon-arrowthickstop-1-s”</li>
 *     <li>width {String} [可选] box-pointer 的宽度，默认为 'auto'</li>
 *   </ul>
 * </pre>
 */
define([
	'jquery', 'vue', 'bc/vue/cors', 'text!bc/vue/page-bar-exporter.html', 'css!bc/vue/page-bar-exporter',
	'bc/vue/box-pointer', 'bc/vue/loading'
], function ($, Vue, CORS, template) {
	'use strict';

	return Vue.component('bc-page-bar-exporter', {
		template: template,
		replace: true,
		props: {
			url: { type: String, required: false, default: null }, // 如无配置默认取 this.$parent.url + '/export'
			max: { type: Number, required: false, default: 3500 }, // 导出条目数的限制
			filename: { type: String, required: false, default: null }, // 浏览器保存下载的文件时使用的文件名，不指定则使用服务器的配置

			title: { type: String, required: false, default: "导出" },
			iconClass: { type: String, required: false, default: "ui-icon-arrowthickstop-1-s" },
			width: { type: String, required: false, default: "auto" }
		},
		data: function () {
			return {
				hidden: true,       // 控制 box-pointer 的显示
				loading: false,
				serverError: null   // 导出失败的服务端错误信息
			}
		},
		computed: {
			outOfLimit: function () {
				return this.max > 0 && this.$parent.count > this.max;
			},
			tip: function () {
				if (this.serverError) return this.serverError;

				if (!this.loading) {
					if (this.max > 0) {
						let grid = this.$parent;
						let self = this;
						if (grid.count > this.max) return `系统限制每次最多导出 ${self.max} 条数据，当前共有 ${grid.count} 条数据，
					  已超出限制，无法导出。请先通过条件搜索减少导出数据的条目数！`;
					}

					return "导出数据可能耗时较长，需要耐心等待！";
				} else {
					return "导出中...";
				}
			}
		},
		methods: {
			// 重置
			reset: function () {
				this.hidden = true;
				this.loading = false;
				this.serverError = null;
			},
			// 导出
			export: function () {
				let grid = this.$parent;

				// 获取搜索条件
				let params = {};
				if (grid.query) {
					if (Array.isArray(grid.query)) {               // 数组
						params[grid.queryKey] = JSON.stringify(grid.query);
					} else if (typeof grid.query == "object") {    // json 对象
						let q = grid.query;
						Object.keys(q).forEach(function (key) {
							let v = q[key], t = typeof (v);
							if (v !== null && v !== "" && t !== "undefined")
								params[key] = v;
						});
					} else if (typeof grid.query == "string") {    // 字符
						params[grid.queryKey] = grid.query;
					}
				}

				// 将参数附加到url后面
				let url = CORS.appendUrlParams(this.url || grid.url + "/export", params);

				// 异步下载文件
				this.loading = true;
				CORS.download(url, this.filename).then(() => this.reset())
				.catch(error => {
					this.loading = false;
					this.serverError = "导出失败：<br>" + error.message;
				});
			}
		}
	});
});