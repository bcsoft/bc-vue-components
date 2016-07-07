/**
 * 搜索组件
 * <pre>
 *   UI 使用：
 *   <bc-search [:advanced="true"] [:quickSearch="true"] [value="keys"] [placeholder="tips"] [@search="search"] [@change="change"]></bc-search>
 * 
 *   参数说明：
 *   <ul>
 *     <li>placeholder {String} [可选] 搜索框提示文字</li>
 *     <li>value {String} [可选] 搜索框默认输入的文字</li>
 *     <li>advanced {Boolean} [可选] 是否使用高级搜索，默认 false</li>
 *     <li>quickSearch {Boolean} [可选] 是否输入值变化时就分发搜索事件，默认按回车键时触发</li>
 *     <li>search {Event} 分发的搜索事件。
 *         事件第 1 个参数为要搜索的关键字
 *     </li>
 *     <li>change {Event} 输入值变动时分发的事件。
 *         事件第 1 个参数为新输入的值，
 *         事件第 2 个参数为原输入的值
 *     </li>
 *   </ul>
 * </pre>
 */
define(['vue'], function (Vue) {
	'use strict';
	return Vue.component('bc-search', {
		template: '<div class="bc-vue-search" style="position:relative;display:inline-block">' +
		'<span @click="search" class="ui-icon ui-icon-search" title="点击执行查询" style="position:absolute;top:50%;margin-top:-8px;left:2px;cursor:pointer"></span>' +
		'<input debounce="200" @keyup.enter="search" type="text" v-model="value" class="ui-widget-content" style="padding:.4em 18px;width:12em;min-height:1em;font-family:inherit;font-size:1.1em" :placeholder="placeholder">' +
		'<span v-if="advanced" @click="showAdvanced" class="ui-icon ui-icon-triangle-1-s" title="点击显示更多查询条件" style="position:absolute;top:50%;margin-top:-8px;right:2px;cursor:pointer"></span>' +
		'</div>',
		replace: true,
		props: {
			placeholder: { type: String, required: false, twoWay: true },
			value: { type: String, required: false, twoWay: true },
			advanced: { type: Boolean, required: false, default: false, twoWay: true },
			quickSearch: { type: Boolean, required: false, default: false, twoWay: true }
		},
		watch: {
			value: function (value, old) {
				this.$dispatch("change", value, old);
				if (this.quickSearch) this.$dispatch("search", value);
			}
		},
		methods: {
			search: function () {
				this.$dispatch("search", this.value);
			},
			showAdvanced: function () {
				console.log("[search] showAdvanced");
			}
		}
	});
});