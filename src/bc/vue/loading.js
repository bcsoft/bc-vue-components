/**
 * 加载提示组件
 * <pre>
 *   UI 使用：
 *   <bc-loading [@speed="2000ms"] [@size="80"]/>
 * 
 *   参数说明：
 *   <ul> 
 *     <li>speed {String} [可选] 动画速度，如 2000ms、1s</li>
 *     <li>size {String} [可选] 尺寸大小，如 5em、80px</li>
 *     <li>maskable {Boolean} [可选] 是否显示蒙罩，默认显示</li>
 *     <li>countable {Boolean} [可选] 是否显示计时，默认不显示</li>
 *     <li>transparent {Boolean} [可选] 背景是否透明，默认透明</li>
 *   </ul>
 * </pre>
 */
define(['vue', 'css!bc/vue/loading'], function (Vue) {
	'use strict';
	return Vue.component('bc-loading', {
		template: '<div class="bc-vue-loading-container ui-overlay">' +
		'<div v-if="maskable" class="mask ui-widget-overlay"></div>' +
		'<div class="actor ui-state-active"' +
		' :style="{\'width\': size, \'height\': size, \'animation-duration\': speed, \'margin-top\': \'calc(\'+ size + \' / -2)\', \'margin-left\': \'calc(\'+ size + \' / -2)\'}"' +
		' :class="{transparent: transparent}">' +
		'</div>' +
		'<div v-if="countable" class="counter ui-state-disabled">{{minutes_}} : {{seconds_}}</div>' +
		'</div>',
		replace: true,
		props: {
			size: { type: String, required: false, default: "4.5em" },
			speed: { type: String, required: false, default: "1s" },
			maskable: { type: Boolean, required: false, default: true },
			countable: { type: Boolean, required: false, default: false },
			transparent: { type: Boolean, required: false, default: true }
		},
		data: function () {
			return { counter: 0, minutes: 0, seconds: 0 };
		},
		computed: {
			minutes_: function () {
				if (this.minutes < 10) return "0" + this.minutes;
				else return "" + this.minutes;
			},
			seconds_: function () {
				if (this.seconds < 10) return "0" + this.seconds;
				else return "" + this.seconds;
			}
		},
		ready: function () {
			var self = this;
			var max = 11;
			setInterval(function () {
				self.seconds++;
				if (self.seconds == max) {
					self.seconds = 0;
					self.minutes++;
					if (self.minutes == max) self.minutes = 0;
				}
			}, 1000);
		},
		methods: {
			reset: function () {
				this.minutes = 0;
				this.seconds = 0;
			}
		}
	});
});