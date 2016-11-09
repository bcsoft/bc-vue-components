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
 *     <li>advanceValue {Array} [可选] 高级搜索值，格式为 [[id, value[, operator, type]], ...]，operator 默认 '='，type 默认 'string'</li>
 *     <li>mixValue {Array} [可选] 搜索的混合值，包含模糊搜索和高级搜索</li>
 *     <li>quick {Boolean} [可选] 是否即输即搜(输入值变化时就分发搜索事件)，默认 false (按回车键时触发)</li>
 *     <li>align {String} [可选] 高级搜索区出现时与模糊搜索区的对齐方式，left|center|right，默认 left</li>
 *     <li>advanceConfig {Array} [可选] 高级搜索条件的配置，不配置代表无高级搜索功能，格式为：
 *           [{id, label[, type][, default][, value]}[, ...]]
 *           <ul>
 *             <li>id {String} 条件的标识符</li>
 *             <li>label {String} 条件的显示文字</li>
 *             <li>type {String} [可选] 值的类型，string|int|float|double|long|date|month|time|datetime|money，默认 string</li>
 *             <li>default {Boolean} [可选] 默认是否显示，默认 false 不显示</li>
 *             <li>value {String} [可选] 默认值</li>
 *           </ul>
 *     </li>
 *     <li>search {Event} 分发的搜索事件，事件第 1 个参数为模糊搜索的值，第 2 个参数为高级搜索的值，第 3 个参数为混合搜索的值</li>
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
			value: { type: String, required: false, default: '' },
			advanceValue: { type: Array, required: false },
			mixValue: { type: Array, required: false },
			advanceConfig: { type: Array, required: false, default: function () { return [] } },
		},
		data: function () {
			return {
				displayList: [],    // 当前显示的高级搜索条件列表
				showAdvance: false, // 高级搜索条件是否处于显示状态
			};
		},
		computed: {
			/** 模糊搜索值的高级条件对象封装 */
			fuzzyValueObj: function () {
				return this.value !== null && this.value !== '' ? [DEFAULT_FUZZY_ID, this.value] : null;
			},
			/** 当高级搜索显示时默认就需显示的条件列表 */
			defaultDisplayList: function () {
				var list = [];
				if (this.advanceConfig) {
					for (var i = 0; i < this.advanceConfig.length; i++) {
						if (this.advanceConfig[i].default) {
							list.push({
								id: this.advanceConfig[i].id,
								value: this.advanceConfig[i].value,
								operator: this.advanceConfig[i].operator,
								type: this.advanceConfig[i].type
							});
						}
					}
				}
				return list;
			},
			/** 获取有效配置的高级条件 */
			advanceValue_: function () {
				if (!this.showAdvance || !this.advanceConfig || !this.advanceConfig.length) return null;
				var vc = [], d, cfg, rv;
				for (var i = 0; i < this.displayList.length; i++) {
					d = this.displayList[i];
					if (d.id && d.operator && d.value) {
						// [id, value, type, operator]
						rv = [d.id, d.value];
						d.type && rv.push(d.type);
						if (d.operator != '=') {
							if (!d.type) rv.push(null);
							rv.push(d.operator);
						}
						vc.push(rv);
					}
				}
				return vc.length ? vc : null;
			},
			/** advanceValue_ 的字符表示, 用于监控高级条件的值是否改变，从而正确触发 change 事件 */
			advanceValueStr: function () {
				return this.advanceValue_ ? JSON.stringify(this.advanceValue_) : this.advanceValue_;
			},
			/** 
			 * 搜索条件的混合值，返回 value、advanceValue_ 混合后的数组值，value 被封装为如下结构：
			 *    ['fuzzy', value]
			 * @return {Array}
			 */
			mixValue_: function () {
				var v;
				if (!this.advanceValue_) {	// 无高级查询条件
					v = this.fuzzyValueObj ? [this.fuzzyValueObj] : null;
				} else {                              // 有高级查询
					if (this.fuzzyValueObj) v = [].concat(this.advanceValue_, [this.fuzzyValueObj]);
					else v = [].concat(this.advanceValue_);
				}
				return v;
			}
		},
		created: function () {
			// 延迟观察 value 的变化
			this.$watch('value', function (value, old) {
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
		ready: function () {
			// 监听 operate 按钮事件
			$(this.$el).on({
				"mouseover": function () {
					$(this).addClass("ui-state-hover");
				},
				"mouseout": function () {
					$(this).removeClass("ui-state-hover");
				}
			}, '.operate button');

			this.initDisplayList();
		},
		destroyed: function () {
			console.log('[search] destroyed');
			$(this.$el).off();
		},
		methods: {
			/** 触发 change 事件 */
			change: function () {
				// 输出条件值
				this.mixValue = this.mixValue_;
				this.advanceValue = this.advanceValue_;

				// 触发事件
				this.$dispatch("change", this.value, this.advanceValue, this.mixValue);
				if (this.quick) this.$dispatch("search", this.value, this.advanceValue, this.mixValue);
			},
			/** 触发 search 事件 */
			search: function () {
				this.$dispatch("search", this.value, this.advanceValue_, this.mixValue_);
			},
			/** 初始化显示的条件列表 */
			initDisplayList: function () {
				this.displayList.length = 0;
				for (var i = 0; i < this.defaultDisplayList.length; i++) {
					this.displayList.push({
						id: this.defaultDisplayList[i].id,
						value: this.defaultDisplayList[i].value,
						operator: this.defaultDisplayList[i].operator,
						type: this.defaultDisplayList[i].type
					});
				}
			},
			/** 获取条件的可用操作符列表 */
			operators: function (id) {
				var operators = [
					{ id: '=', label: '等于' },
					{ id: '>=', label: '大于等于' },
					{ id: '<=', label: '小于等于' },
					{ id: '>', label: '大于' },
					{ id: '<', label: '小于' },
					{ id: '!=', label: '不等于' }
				];
				var cfg = this.getConditionConfig(id);
				if (!cfg || !cfg.type || cfg.type == 'string') {
					operators.push({ id: '@', label: '包含' });
					//operators.push({ id: '@left', label: '开头包含' });
					//operators.push({ id: '@right', label: '结尾包含' });
				}
				return operators;
			},
			/** 添加新条件 */
			addCondition: function () {
				this.displayList.push({ id: null, operator: '=', value: null, type: null });
			},
			/** 删除条件 */
			deleteCondition: function (index) {
				this.displayList.splice(index, 1);
				if (!this.displayList.length) {
					this.showAdvance = false;
				}
			},
			/** 清空所有条件 */
			clearCondition: function () {
				this.displayList.forEach(function (c) { c.value = "" });
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
				if (type == 'id') {
					condition.value = null;
					var cfg = this.getConditionConfig(condition.id);
					condition.type = cfg.type;
				}
			}
		}
	});
});