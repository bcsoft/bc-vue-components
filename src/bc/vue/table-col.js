/**
 * Table 列宽定义组件
 * <pre>
 *   UI 使用：
 *   <table>
 *     <colgroup is="tableCol" :columns="columns" [:add-sn="true"] [:add-empty="true"]></colgroup>
 *     ...
 *   </table>
 *
 *   JS 代码：
 *   new Vue({
 *     data: {
 *       columns: [
 *         { id: "name", label: "姓名", width: "20em" },
 *         { id: "age", label: "年龄", width: "10em" },
 *         { id: "sex", label: "性别", width: "10em" }
 *       ]
 *     }
 *   });
 * 
 *   参数说明：
 *   <ul>
 *     <li>columns {Array} 列宽定义数组，如 [{key: "name", label: "姓名", width: "20em"}, ...]</li>
 *     <li>addSn {Boolean} [可选] 是否在开头自动添加序号列，默认 false</li>
 *     <li>addEmpty {Boolean} [可选] 是否在末尾自动添加空白自动列宽列，默认 false</li>
 *   </ul>
 * </pre>
 */
define(['vue'], function (Vue) {
	'use strict';
	return Vue.component('bc-table-col', {
		template1: '<colgroup data-rowspan={{rowspan}}>' +
		'<col v-if="addSn" data-id="_sn" style="width:3em">' +
		'<col v-for="c in columns" data-id="{{c.id}}" :style="{width:c.width}">' +
		'<col v-if="addEmpty" data-id="_empty" style="width:auto;min-width:1em;">' +
		'</colgroup>',
		template: '<colgroup v-if="addSn" data-id="_sn" style="width:3em"></colgroup>' +
		'<colgroup v-for="c in columns" data-id="{{c.id}}" :style="{width:c.width}" span="{{c.children ? c.children.length || 1 : 1}}">' +
		'<col v-if="c.children" v-for="d in c.children" data-id="{{d.id}}" :style="{width:d.width}">' +
		'</colgroup>' +
		'<colgroup v-if="addEmpty" data-id="_empty" style="width:auto;min-width:1em;"></colgroup>',
		replace: true,
		props: {
			columns: { type: Array, required: true },
			addSn: { type: Boolean, required: false, default: false },
			addEmpty: { type: Boolean, required: false, default: false }
		},
		computed: {
			rowspan: function () {
				var rowspan = 1;
				for (var i = 0; i < this.columns.length; i++) {
					if (this.columns[i].children && this.columns[i].children.length) {
						rowspan = 2; // 复杂表头（仅支持跨一行）
						break;
					}
				}
				return rowspan;// 简单表头
			}
		}
	});
});