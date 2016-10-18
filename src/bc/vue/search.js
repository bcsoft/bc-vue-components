/**
 * 搜索组件
 * <pre>
 *   UI 使用：
 *   <bc-search [quick="true|false"] [value="xxx"] [placeholder="xxx"] 
 *              [@search="xxx"] [@change="xxx"]></bc-search>
 *   参数说明：
 *   <ul>
 *     <li>placeholder {String} [可选] 搜索框未输入信息时的背景文字</li>
 *     <li>value {String} [可选] 模糊搜索的默认值，即搜索框默认输入的文字</li>
 *     <li>quick {Boolean} [可选] 是否即输即搜(输入值变化时就分发搜索事件)，默认 false (按回车键时触发)</li>
 *     <li>simple {Boolean} [可选] 控制 value 属性值的输出格式，无高级搜索时 simple 默认为 true，有高级搜索时 simple 默认为 false。simple=true 时，模糊搜索将原值输出，否则封装为 {} 对象格式</li>
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
 *     <li>change {Event} 搜索条件变动时分发的事件，事件第 1 个参数为新的搜索值，参考 search 事件</li>
 *   </ul>
 * </pre>
 */
define(['vue', 'text!bc/vue/search.html', 'css!bc/vue/search'], function (Vue, template) {
	'use strict';
	var DEFAULT_FUZZY_ID = 'fuzzy';
	return Vue.component('bc-search', {
		template: template,
		replace: true,
		props: {
			placeholder: { type: String, required: false },
			align: { type: String, required: false, default: 'left' },
			quick: { type: Boolean, required: false, default: false },
			simple: { type: Boolean, required: false, default: undefined },
			mixValue: { type: [String, Array, Object], required: false },
			advanceConfig: { type: Array, required: false, default: function () { return [] } },
		},
		data: function () {
			return {
				displayList: [],    // 当前显示的高级搜索条件列表
				showAdvance: false, // 高级搜索条件是否处于显示状态
				fuzzyValue: ''
			};
		},
		computed: {
			/** 模糊搜索值的高级条件对象封装 */
			fuzzyValueObj: function () {
				return this.fuzzyValue !== null && this.fuzzyValue !== '' ? { id: DEFAULT_FUZZY_ID, value: this.fuzzyValue } : null;
			},
			/** 当高级搜索显示时默认就需显示的条件列表 */
			defaultDisplayList: function () {
				var list = [];
				if (this.advanceConfig) {
					for (var i = 0; i < this.advanceConfig.length; i++) {
						if (this.advanceConfig[i].default) {
							list.push({
								id: this.advanceConfig[i].id,
								value: this.advanceConfig[i].value,             // 默认值
								operator: this.advanceConfig[i].operator || '=' // 默认操作符
							});
						}
					}
				}
				return list;
			},
			/** 获取有效配置的高级条件 */
			advanceValue: function () {
				if (!this.showAdvance || !this.advanceConfig || !this.advanceConfig.length) return [];
				var vc = [], d, cfg;
				for (var i = 0; i < this.displayList.length; i++) {
					d = this.displayList[i];
					if (d.id && d.operator && d.value) {
						cfg = this.getConditionConfig(d.id);
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
			/** advanceValue 的字符表示, 用于监控高级条件的值是否改变，从而正确触发 change 事件 */
			advanceValueStr: function () {
				return JSON.stringify(this.advanceValue);
			},
			/** 
			 * 搜索条件：混合模糊查询和高级查询的值
			 * 1) 如果无高级查询，则返回 fuzzyValue 的值
			 * 2) 如果有高级查询，则返回 fuzzyValue、advanceValue 混合后的数组值，fuzzyValue 被封装为如下结构：
			 *    {id: '_fuzzy_', value: fuzzyValue}
			 * @return {Array|String}
			 */
			mixValue_: function () {
				if (this.advanceValue.length == 0) {	// 无高级查询条件
					return this.simple ? this.fuzzyValue : this.fuzzyValueObj;
				} else {                              // 有高级查询
					if (this.fuzzyValueObj) return [].concat(this.advanceValue, this.fuzzyValueObj);
					else return [].concat(this.advanceValue);
				}
			}
		},
		created: function () {
			// 无高级搜索时 simple 默认为 true
			// 有高级搜索时 simple 默认为 false
			if (typeof this.simple === 'undefined') {
				this.simple = !(this.advanceConfig && this.advanceConfig.length);
			}

			// 用户传入的值默认设为模糊搜索框的值
			if (typeof this.mixValue === 'string') this.fuzzyValue = this.mixValue;

			// 延迟观察 fuzzyValue 的变化
			this.$watch('fuzzyValue', function (value, old) {
				this.change();
			})
		},
		watch: {
			advanceConfig: function (value, old) {
				this.showAdvance = false;
				this.initDisplayList();
			},
			advanceValueStr: function (value, old) {
				this.change();
			}
		},
		methods: {
			/** 触发 change 事件 */
			change: function () {
				// 输出条件值
				this.mixValue = this.mixValue_;

				// 触发事件
				this.$dispatch("change", this.mixValue);
				if (this.quick) this.$dispatch("search", this.mixValue);
			},
			/** 触发 search 事件 */
			search: function () {
				this.$dispatch("search", this.mixValue_);
			},
			/** 初始化显示的条件列表 */
			initDisplayList: function () {
				this.displayList.length = 0;
				for (var i = 0; i < this.defaultDisplayList.length; i++) {
					this.displayList.push({
						id: this.defaultDisplayList[i].id,
						value: this.defaultDisplayList[i].value,
						operator: this.defaultDisplayList[i].operator
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
				if (this.showAdvance) {  // 添加一个新的条件
					this.displayList.push({ id: null, operator: '=', value: null });
				} else {                 // 初次显示时，列出默认要显示的条件
					this.initDisplayList();
					this.showAdvance = true;
				}
			},
			/** 删除条件 */
			deleteCondition: function (index) {
				this.displayList.splice(index, 1);
				if (!this.displayList.length) {
					this.showAdvance = false;
				}
			},
			/** 获取条件的配置信息 */
			getConditionConfig: function (id) {
				if (this.advanceConfig) {
					for (var i = 0; i < this.advanceConfig.length; i++)
						if (this.advanceConfig[i].id == id) return this.advanceConfig[i];
				}
				return null;
			},
			/** 内部控件的条件变动事件 
			 * @param type {String} 变动类型：
			 *        type='id'：用户改变了条件的标识符
			 *        type='operator'：用户改变了条件的操作符
			 *        type='value'：用户改变了条件的输入值
			 * @param condition {Object} 条件
			 */
			editCondition: function (type, condition) {
				// 切换条件就清空值
				if (type == 'id') condition.value = null;
			}
		}
	});
});