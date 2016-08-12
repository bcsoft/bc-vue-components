/**
 * 搜索组件
 * <pre>
 *   UI 使用：
 *   <bc-search [quick-search="true|false"] [fuzzy-value="xxx"] [placeholder="xxx"] 
 *              [@search="search"] [@change-value="change"]></bc-search>
 *   获取搜索框的值：var value = $bcSerach.value
 *   参数说明：
 *   <ul>
 *     <li>placeholder {String} [可选] 搜索框未输入信息时的提示文字</li>
 *     <li>fuzzy-value {String} [可选] 模糊搜索的默认值，及搜索框默认输入的文字</li>
 *     <li>advanced {Boolean} [可选] 是否使用高级搜索，默认 false</li>
 *     <li>quick-search {Boolean} [可选] 是否即输即搜(输入值变化时就分发搜索事件)，默认 false (按回车键时触发)</li>
 *     <li>align {String} [可选] 高级搜索区出现时与模糊搜索区的对齐方式，left|center|right，默认 left</li>
 *     <li>advanceConfig {Array} [可选] 高级搜索条件的配置，不配置代表无高级搜索功能，格式为：
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
 *     <li>change-value {Event} 搜索条件变动时分发的事件，事件第 1 个参数为新的搜索值</li>
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
			placeholder: { type: String, required: false },
			align: { type: String, required: false, default: 'left' },
			quickSearch: { type: Boolean, required: false, default: false },
			fuzzyValue: { type: String, required: false, default: null },
			advanceConfig: { type: Array, required: false, default: function () { return [] } },
		},
		data: function () {
			return {
				displayList: [],   // 用户添加的高级搜索条件
				showAdvance: false // 高级搜索条件是否处于显示状态
			};
		},
		computed: {
			fuzzyValueObj: function () {
				return this.fuzzyValue ? { id: FUZZY_ID, value: this.fuzzyValue } : null;
			},
			defaultDisplayList: function () {
				var list = [];
				for (var i = 0; i < this.advanceConfig.length; i++) {
					if (this.advanceConfig[i].default) {
						list.push({
							id: this.advanceConfig[i].id,
							value: this.advanceConfig[i].value,   // 默认值
							operator: '='                         // 默认操作符
						});
					}
				}
				return list;
			},
			/** 
			 * 搜索条件：混合模糊查询和高级查询的值
			 * 1) 如果无高级查询，则返回 fuzzyValue 的值
			 * 2) 如果有高级查询，则返回 fuzzyValue、advanceValue 混合后的数组值，fuzzyValue 被封装为如下结构：
			 *    {id: '_fuzzy_', value: fuzzyValue}
			 * @return {Array|String}
			 */
			valueStr: function () {
				var vc = this.getValidConditions();
				if (vc.length == 0) {	                // 无高级查询条件
					return this.fuzzyValue || null;
				} else {                              // 有高级查询
					if (this.fuzzyValueObj) return JSON.stringify([].concat(vc, this.fuzzyValueObj));
					else return JSON.stringify(vc);
				}
			},
			value: function () {
				var isObjStr = (typeof (this.valueStr) == "string" &&
					(this.valueStr.indexOf("{") == 0 || this.valueStr.indexOf("[") == 0));
				return isObjStr ? JSON.parse(this.valueStr) : this.valueStr;
			}
		},
		watch: {
			valueStr: function (value, old) {
				this.$dispatch("change-value", this.value);
				if (this.quickSearch) this.$dispatch("search", this.value);
			}
		},
		created: function () {
			this.initDisplayList();
		},
		methods: {
			/** 初始化显示的条件列表 */
			initDisplayList: function () {
				for (var i = 0; i < this.defaultDisplayList.length; i++) {
					this.displayList.push({
						id: this.defaultDisplayList[i].id,
						value: this.defaultDisplayList[i].value,   // 默认值
						operator: '='                              // 默认操作符
					});
				}
			},

			/** 获取条件的可用操作符列表 */
			operators: function (id) {
				var operators = [
					{ id: '=', label: '等于' },
					{ id: '>', label: '大于' },
					{ id: '<', label: '小于' },
					{ id: '<>', label: '不等于' },
					{ id: '<=', label: '不大于' },
					{ id: '>=', label: '不小于' }
				];
				var cfg = this.getConditionConfig(id);
				// console.log("[search] operators cfg=%s", JSON.stringify(cfg));
				if (!cfg || !cfg.type || cfg.type == 'string') {
					operators.push({ id: '@', label: '包含' });
				}
				return operators;
			},

			/** 添加新条件 */
			addCondition: function () {
				if (this.showAdvance) {
					this.displayList.push({ operator: '=' });
				} else {
					this.showAdvance = true;
				}
			},

			/** 删除条件 */
			deleteCondition: function (index) {
				this.displayList.splice(index, 1);
				if (!this.displayList.length) {
					this.showAdvance = false;
					this.initDisplayList();
				}
			},

			/** 发布搜索事件 */
			search: function () {
				this.$dispatch("search", this.value);
			},

			/** 获取有效配置的特殊条件 */
			getValidConditions: function () {
				if (!this.showAdvance) return [];
				var vc = [];
				var d;
				for (var i = 0; i < this.displayList.length; i++) {
					d = this.displayList[i];
					if (d.id && d.operator && d.value) {
						var cfg = this.getConditionConfig(d.id);
						vc.push({
							id: d.id,                    // 键
							value: d.value,              // 值
							type: cfg.type || 'string',  // 类型
							operator: d.operator,        // 操作符
							label: cfg.label
						});
					}
				}
				return vc;
			},

			/** 获取条件的配置信息 */
			getConditionConfig: function (id) {
				for (var i = 0; i < this.advanceConfig.length; i++)
					if (this.advanceConfig[i].id == id) return this.advanceConfig[i];
				return null;
			},

			/** 内部控件的条件变动事件 
			 * @param type {String} 变动类型：
			 *        type='id'：用户改变了条件的表示符
			 *        type='operator'：用户改变了条件的操作符
			 *        type='value'：用户改变了条件的输入值
			 * @param condition {Object} 条件
			 */
			changeCondition: function (type, condition) {
				if (type == 'id') {
					condition.value = null;  // 切换条件就清空值
				} else if (type == 'operator') {

				} else if (type == 'value') {

				}
			}
		}
	});
});