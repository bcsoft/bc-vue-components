/**
 * 分页条组件
 * <pre>
 *   UI 使用：
 *   <bc-page-bar [:pageable="true"] [:refreshable="true"] [:exportable="true"]/>
 * 
 *   参数说明：
 *   <ul>
 *     <li>pageable {Boolean} [可选] 是否可分页，默认 false</li>
 *     <li>refreshable {Boolean} [可选] 是否显示刷新按钮，默认 false</li>
 *     <li>exportable {Boolean} [可选] 是否显示导出按钮，默认 false</li>
 *     <li>importable {Boolean} [可选] 是否显示导入按钮，默认 false</li>
 * 
 *     <li>change {Event} 分页参数变动、点击刷新按钮分发的事件。
 *         事件第 1 个参数为引发事件的原因（'changePageNo' - 页码变动、'changePageSize' - 页容量变动、'clickRefresh' - 点击刷新按钮）,
 *         事件第 2 个参数为新 pageNo 的值，
 *         事件第 3 个参数为新 pageSize 的值
 *     </li>
 *     <li>export {Event} 点击导出按钮分发的事件。事件第 1 个参数为要导出的页码(pageNo)，-1 代表导出全部</li>
 *     <li>import {Event} 点击导入按钮分发的事件。</li>
 *   </ul>
 * </pre>
 */
define(['jquery', 'vue', 'text!bc/vue/page-bar.html', 'css!bc/vue/page-bar'], function ($, Vue, template) {
	'use strict';
	// Grid 组件的分页条 - 注册为全局组件
	var DEFAULT_PAGE_SIZES = [25, 50, 100];
	return Vue.component('bc-page-bar', {
		template: template,
		replace: true,
		props: {
			pageable: { type: Boolean, required: false, default: false, twoWay: true },		// 可分页
			pageNo: { type: Number, required: false, default: 1, twoWay: true },			// 当前页码
			pageSize: { type: Number, required: false, default: DEFAULT_PAGE_SIZES[0], twoWay: true },	// 当前页容量
			pageSizes: { type: Array, required: false, default: DEFAULT_PAGE_SIZES, twoWay: true },	// 可选页容量
			count: { type: Number, required: false, default: 0, twoWay: true },				// 总条目数

			refreshable: { type: Boolean, required: false, default: true, twoWay: true },	// 刷新
			exportable: { type: Boolean, required: false, default: false, twoWay: true },	// 导出
			importable: { type: Boolean, required: false, default: false, twoWay: true }	// 导入
		},
		data: function () {
			return { pageCount: Math.ceil(this.count / this.pageSize) };	// 页码数
		},
		ready: function () {
			var $el = $(this.$el);
			// 鼠标悬停样式的控制
			$el.on({
				"mouseover": function () {
					$(this).addClass("ui-state-hover");
				},
				"mouseout": function () {
					$(this).removeClass("ui-state-hover");
				}
			}, ".icon");
		},
		beforeDestroy: function () {
			$(this.$el).off(); // 移除用jq绑定的所有事件处理程序
		},
		watch: {
			count: function (val, oldVal) {
				//console.log('[PageBar] watch.count: new=%s, old=%s', val, oldVal);
				this.pageCount = Math.ceil(val / this.pageSize);
			}
		},
		methods: {
			/** 首页、上一页、下一页、尾页 */
			toPage: function (pageNo) {
				pageNo = Math.max(1, pageNo); // 最小为第一页
				if (pageNo == this.pageNo) return;
				console.log('[PageBar] toPage: new=%s, old=%s', pageNo, this.pageNo);
				this.pageNo = pageNo;
				this.$dispatch('change', 'changePageNo', this.pageNo, this.pageSize);
			},
			/** 改变 pageSize */
			changePageSize: function (pageSize) {
				if (pageSize == this.pageSize) return;
				console.log('[PageBar] changePageSize: new=%s, old=%s', pageSize, this.pageSize);
				this.pageNo = this.pageNo < 2 ? this.pageNo : Math.floor(((this.pageNo - 1) * this.pageSize / pageSize + 1));
				this.pageSize = pageSize;
				this.pageCount = Math.ceil(this.count / this.pageSize);
				this.$dispatch('change', 'changePageSize', this.pageNo, this.pageSize);
			}
		}
	});
});