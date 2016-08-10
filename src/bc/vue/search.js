/**
 * 搜索组件
 * <pre>
 *   UI 使用：
 *   <bc-search [quick-search="true|false"] [fuzzy-value="xxx"] [placeholder="xxx"] 
 *              [@search="search"] [@change-condition="change"]></bc-search>
 *   获取搜索框的值：var value = $bcSerach.value
 *   参数说明：
 *   <ul>
 *     <li>placeholder {String} [可选] 搜索框未输入信息时的提示文字</li>
 *     <li>fuzzy-value {String} [可选] 模糊搜索的默认值，及搜索框默认输入的文字</li>
 *     <li>advanced {Boolean} [可选] 是否使用高级搜索，默认 false</li>
 *     <li>quick-search {Boolean} [可选] 是否即输即搜(输入值变化时就分发搜索事件)，默认 false (按回车键时触发)</li>
 *     <li>align {String} [可选] 高级搜索区出现时与模糊搜索区的对齐方式，left|center|right，默认 left</li>
 *     <li>conditions {Array} [可选] 高级搜索条件的配置，不配置代表无高级搜索功能，格式为：
 *           [{id, label[, type][, default][, value]}[, ...]]
 *           <ul>
 *             <li>id {String} 条件的标识符</li>
 *             <li>label {String} 条件的显示文字</li>
 *             <li>type {String} [可选] 值的类型，string|int|float|double|long|date|money，默认 string</li>
 *             <li>default {Boolean} [可选] 默认是否显示，默认 false 不显示</li>
 *             <li>value {String} [可选] 默认值</li>
 *           </ul>
 *     </li>
 *     <li>search {Event} 分发的搜索事件，事件第 1 个参数为要搜索的值，此值格式为：
 *           1）模糊搜索时为 fuzzyValue 属性的值 (String 类型)
 *           1）有高级搜索时为 value 属性的值 (Object 类型 {id, value[, type][, label]})
 *     </li>
 *     <li>change-condition {Event} 搜索条件变动时分发的事件，事件第 1 个参数为新的搜索值，第 2 个参数为旧的搜索值</li>
 *   </ul>
 * </pre>
 */
define(['vue', 'text!bc/vue/search.html', 'css!bc/vue/search'], function (Vue, template) {
	'use strict';
	var FUZZY_ID = '_fuzzy_';
	return Vue.component('bc-search', {
		template: template,
		replace: true,
		props: {
			placeholder: { type: String, required: false, twoWay: true },
			fuzzyValue: { type: String, required: false, twoWay: true },
			quickSearch: { type: Boolean, required: false, default: false, twoWay: true },
			align: { type: String, required: false, default: 'left', twoWay: true },
			conditions: { type: Array, required: false, default: function () { return [] }, twoWay: true }
		},
		data: function () {
			return {
				pickedConditions: []   // 用户添加的高级搜索条件
			};
		},
		watch: {
			value: function (value, old) {
				this.$dispatch("change-condition", value, old);
				if (this.quickSearch) this.$dispatch("search", value);
			},
			conditions: function (value, old) {
				// 重置 pickedConditions
				this.pickedConditions = [];
			}
		},
		computed: {
			// 搜索框当前值：混合模糊查询和高级查询的值
			value: function () {
				var validConditions = this.getValidConditions();
				if (this.fuzzyValue)
					validConditions.push({ id: FUZZY_ID, value: this.fuzzyValue, type: 'string' });
				return validConditions;
			}
		},
		methods: {
			// 发布搜索事件
			search: function () {
				this.$dispatch("search", this.value);
			},
			// 获取操作符列表
			operators: function (id) {
				// console.log("[search] operators");
				var cfg = this.getConditionConfig(id);
				var operators = [
					{ id: '=', label: '等于' },
					{ id: '>', label: '大于' },
					{ id: '<', label: '小于' },
					{ id: '<>', label: '不等于' },
					{ id: '<=', label: '不大于' },
					{ id: '>=', label: '不小于' }
				];
				if (!cfg.type || cfg.type == 'string') {
					operators.push({ id: '@', label: '包含' });
				}
				return operators;
			},
			// 添加新条件
			addCondition: function () {
				var c = 0;
				if (this.pickedConditions.length == 0) {
					// 默认条件立即显示
					for (var i = 0; i < this.conditions.length; i++) {
						if (this.conditions[i].default) {
							this.pickedConditions.push({
								id: this.conditions[i].id,
								value: this.conditions[i].value,   // 默认值
								operator: '='                      // 默认操作符
							});
							c++;
						}
					}
				}

				// 没有默认条件或已被用户清空则新建一个
				if (c == 0) this.pickedConditions.push({ operator: '=' });

				console.log("[search] addCondition: " + JSON.stringify(this.pickedConditions));
			},
			// 删除条件
			deleteCondition: function (index) {
				this.pickedConditions.splice(index, 1);
			},
			// 获取有效配置的特殊条件
			getValidConditions: function () {
				var validConditions = [];
				for (var i = 0; i < this.pickedConditions.length; i++) {
					if (this.pickedConditions[i].value !== undefined
						&& this.pickedConditions[i].value !== '') {
						var cfg = this.getConditionConfig(this.pickedConditions[i].id);
						validConditions.push({
							id: this.pickedConditions[i].id,              // 键
							value: this.pickedConditions[i].value,        // 值
							type: cfg.type || 'string',                   // 类型
							operator: this.pickedConditions[i].operator,  // 操作符
							label: cfg.label
						});
					}
				}
				return validConditions;
			},
			// 获取条件的配置信息
			getConditionConfig: function (id) {
				for (var i = 0; i < this.conditions.length; i++) {
					if (this.conditions[i].id == id) {
						return this.conditions[i];
					}
				}
				return null;
			}
		}
	});
});