/**
 * 单选按钮组件
 * <pre>
 *   UI 使用：
 *   <bc-buttton-set items="['a', 'b']" value="a"></bc-button-set>
 * 
 *   参数说明：
 *   <ul>
 *     <li>items {Array} 选项列表，结构为 [{id: 1, label: "a", active: true|false}, ...], active 为 true 代表此选项被选中</li>
 *     <li>value {Striog|Number} 当前值</li>
 *     <li>change {Event} 选中值变动分发的事件。
 *         事件第 1 个参数为新选中的项的值,
 *         事件第 2 个参数为原选中的项的值
 *     </li>
 *   </ul>
 * </pre>
 */
define(['jquery', 'vue'], function ($, Vue) {
	'use strict';
	return Vue.component('bc-button-set', {
		template: '<div class="bc-vue-button-set ui-buttonset" style="display:inline-block">' +
		'<div v-for="i in items" data-id="{{i.hasOwnProperty(\'id\') ? i.id : $index}}" class="ui-button ui-widget ui-state-default ui-button-text-only" style="font-family:inherit;font-size:1em"' +
		' :class="{\'ui-corner-left\': $index == 0, \'ui-corner-right\': $index == items.length - 1, \'ui-state-active\': isActive(i)}"' +
		' :style="{\'margin-right\': \'-1px\', \'z-index\': value == i.id ? items.length : 0}">' +
		'<span style="font-size: 1em" class="ui-button-text" @click="clickItem(i, $index)">{{i.label || i}}</span>' +
		'</div>' +
		'</div>',
		replace: true,
		props: {
			items: { type: Array, required: true },     // 可选列表
			value: { required: false, default: null }   // 当前值
		},
		created: function () {
			if (this.value === null) { // 未设置就从列表中取 active=true 项的 id 值
				for (var i = 0; i < this.items.length; i++) {
					if (this.items[i].active) {
						this.value = this.items[i].id;
						break;
					}
				}
			}
		},
		watch: {
			value: function (value, old) {
				this.$dispatch("change", value, old);
			}
		},
		methods: {
			clickItem: function (item, index) {
				this.value = (typeof item == "object" ? item.id : item);
			},
			isActive: function (item) {
				if (typeof item == "object") return this.value == item.id;
				else return this.value == item;
			}
		}
	});
});