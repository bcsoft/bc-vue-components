/**
 * 按钮组件
 * <pre>
 *   UI 使用：
 *   <bc-buttton [@click="yourMethodName"]/>
 * 
 *   参数说明：
 *   <ul>
 *     <li>text {String} [可选] 按钮显示的文字</li>
 *     <li>click {Event} 点击按钮分发的事件</li>
 *   </ul>
 * </pre>
 */
define(['jquery', 'vue'], function ($, Vue) {
	'use strict';
	return Vue.component('bc-button', {
		template: '<button class="bc-vue-button ui-button ui-widget ui-state-default ui-corner-all" style="font-family:inherit" type="button" :class="btnClass">' +
		'<span class="ui-button-icon-primary ui-icon" v-if="iconClass" :class="iconClass"></span>' +
		'<span class="ui-button-text">{{text}}<slot></slot></span>' +
		'</button>',
		replace: true,
		props: {
			text: { type: String, required: false, default: "　", twoWay: true },
			iconClass: { type: String, required: false, twoWay: true }
		},
		computed: {
			btnClass: function () {
				var c, hasText = this.text && this.text != "　";
				if (hasText && this.iconClass) c = "ui-button-text-icon-primary";
				else if (!hasText && this.iconClass) c = "ui-button-icon-only";
				else if (hasText && !this.iconClass) c = "ui-button-text-only";
				else c = "ui-button-text-only";
				console.log("[Button] computed.btnClass=%s", c);
				return c;
			}
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
			});
		},
		beforeDestroy: function () {
			$(this.$el).off(); // 移除用jq绑定的所有事件处理程序
		},
		methods: {}
	});
});