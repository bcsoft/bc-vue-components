/**
 * 工具条组件
 * <pre>
 *   UI 使用：
 *   <bc-toolbar [@click="yourMethodName"]>
 *     ...[slot content]
 *   </bc-toolbar>
 * </pre>
 */
define(['vue', "css!bc/vue/toolbar"], function (Vue) {
	'use strict';
	return Vue.component('bc-toolbar', {
		template: '<div class="bc-vue-toolbar ui-widget-content">' +
		'<slot></slot>' +
		'</div>',
		replace: true,
		props: {}
	});
});