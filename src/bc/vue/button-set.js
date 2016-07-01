/**
 * 单选按钮组件
 * <pre>
 *   UI 使用：
 *   <bc-buttton-set set="['a', 'b']"></bc-button-set>
 * 
 *   参数说明：
 *   <ul>
 *     <li>items {Array} 选项列表，["", ...] 或 [{id: 1, label: "a"}, ...]</li>
 *     <li>change {Event} 选中值变动分发的事件。
 *         事件第 1 个参数为新选中的项,
 *         事件第 2 个参数为原选中的项
 *     </li>
 *   </ul>
 * </pre>
 */
define(['jquery', 'vue'], function ($, Vue) {
	'use strict';
	return Vue.component('bc-button-set', {
		template: '<div class="bc-vue-button-set ui-buttonset" style="display:inline-block">' +
		'<div v-for="i in items" data-id="{{i.hasOwnProperty(\'id\') ? i.id : $index}}" class="ui-button ui-widget ui-state-default ui-button-text-only" style="font-family:inherit"' +
		' :class="{\'ui-corner-left\': $index == 0, \'ui-corner-right\': $index == items.length - 1, \'ui-state-active\': $index == active}"' +
		' :style="{\'margin-right\': \'-1px\', \'z-index\': $index == active ? items.length : 0}">' +
		'<span class="ui-button-text" @click="clickItem(i, $index)">{{i.label || i}}</span>' +
		'</div>' +
		'</div>',
		replace: true,
		props: {
			items: { type: Array, required: true, twoWay: true },
			active: { type: Number, required: false, twoWay: true },
			type: { type: String, required: false, default: "radios", twoWay: true } // radios | checkboxes
		},
		computed: {
		},
		ready: function () {
		},
		watch: {
			active: function (value, old) {
				//console.log("[button-set] change new=%d, old=%o", value, old);
				this.$dispatch("change", this.items[value], this.items[old]);
			}
		},
		methods: {
			clickItem: function (item, index) {
				if (this.active !== index) this.active = index;
			}
		}
	});
});