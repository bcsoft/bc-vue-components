/**
 * 气泡组件
 * <pre>
 *   UI 使用：
 *   <bc-box-pointer [hidden="true"] [width="8em"]/>
 * 
 *   参数说明：
 *   <ul>
 *     <li>hidden {Boolean} [可选] 是否隐藏不显示，默认为 true</li>
 *     <li>width {String} [可选] 宽度，默认为 'auto'</li>
 *   </ul>
 * </pre>
 */
define(['vue', 'text!bc/vue/box-pointer.html', 'css!bc/vue/box-pointer'], function (Vue, template) {
	'use strict';
	return Vue.component('bc-box-pointer', {
		template: template,
		replace: true,
		props: {
			hidden: { type: Boolean, required: false, default: true },
			width: { type: String, required: false, default: "auto" }
		},
		data: function () {
			return {
				closeClass: ''
			}
		},
		methods: {
			close: function(){
				this.hidden = true;
				this.$dispatch("closed");
			}
		}
	});
});