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

	/** 判断条件是否为双值配置 */
	function isDiadic(operator) {
		// []、[)、()、(]
		return /(^\[\]$)|(^\[\)$)|(^\(\]$)|(^\(\)$)/.test(operator);
	}

	/** 初始化高级搜索显示的条件列表 */
	function initAdvanceOptions(vm) {
		if (vm.advanceConfig && vm.advanceConfig.options) {
			vm.displayConditions.length = 0;
			var cp;
			vm.advanceConfig.options.forEach(function (option) {
				option.diadic = isDiadic(option.operator); // 是否为双值条件
				option.value = option.diadic ? [] : "";
				if (option.default !== false) {
					cp = {};
					for (var key in option) cp[key] = option[key];
					vm.displayConditions.push(cp);
				}
			});
			//console.log("[initAdvanceOptions] displayConditions=%s", JSON.stringify(vm.displayConditions));
		}
	}

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
			// 数组-条件列表：[{id, label[, type][, default][, value]}, ...]
			// String: 异步加载的 url
			// 对象：{conditions: [{},...], style}
			advanceConfig: { type: [String, Array, Object], required: false, default: null },
		},
		data: function () {
			return {
				displayConditions: [], // 当前显示的高级搜索条件列表
				showAdvance: false, // 高级搜索条件是否处于显示状态
			};
		},
		computed: {
			advanceStyle: function () {
				if (!this.advanceConfig) return null;
				else {
					return {
						maxHeight: this.advanceConfig.maxHeight,
						height: this.advanceConfig.height,
						width: this.advanceConfig.width,
						maxWidth: this.advanceConfig.maxWidth
					};
				}
			},
			/** 模糊搜索值的高级条件对象封装 */
			fuzzyValueObj: function () {
				return this.value !== null && this.value !== '' ? [DEFAULT_FUZZY_ID, this.value] : null;
			},
			/** 获取有效配置的高级条件 */
			advanceValue_: function () {
				if (!this.advanceConfig) return null;
				var all = [], one, value;
				this.displayConditions.forEach(function(d) {
					value = Array.isArray(d.value) ? (d.value.length ? d.value : null) : d.value;
					if (d.id && value) {
						// [id, value, type, operator]
						one = [d.id, d.value];
						d.type && one.push(d.type);
						if (d.operator) {
							if (!d.type) one.push(null);
							one.push(d.operator);
						}
						all.push(one);
					}
				});
				return all.length ? all : null;
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
			});

			// 重新整理 advanceConfig 为标准结构 
			// {url, options, style}
			if (typeof (this.advanceConfig) == "string") {  // url
				this.advanceConfig = { url: this.advanceConfig };
				this.hasAdvance = true;
			} else if (Array.isArray(this.advanceConfig)) { // options
				this.advanceConfig = { options: this.advanceConfig };
				this.hasAdvance = true;
			} else if (Object.prototype.toString.call(this.advanceConfig) === "[object Object]") {
				// all
				this.hasAdvance = true;
			} else {
				this.advanceConfig = null;
				this.hasAdvance = false;
			}
			//console.log("[created] advanceConfig=%s", JSON.stringify(this.advanceConfig));
			initAdvanceOptions(this);
		},
		watch: {
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
		},
		destroyed: function () {
			console.log('[search] destroyed');
			$(this.$el).off();
		},
		methods: {
			/** 切换高级搜索区的显示 */
			toggleAdvance: function () {
				var vm = this;
				if (this.advanceConfig.loading) {       // 异步加载中就直接返回
					return;
				} else if (this.advanceConfig.options) { // 已有候选条件就直接切换显示
					this.showAdvance = !this.showAdvance;
					return;
				} else { // 异步加载高级搜索配置后再显示
					if (!this.advanceConfig.url) {
						alert("缺少高级搜索的 advanceConfig.url 属性配置");
						return;
					}

					vm.advanceConfig.loading = true;
					fetch(this.advanceConfig.url, {
						headers: { "Content-Type": "application/json;charset=utf-8" },
						credentials: 'include'  // include cookies
					}).then(function (res) {
						return res.ok ? res.json() : res.text().then(function (msg) { throw new Error(msg) });
					}).then(function (options) {
						if (Array.isArray(options)) {
							vm.advanceConfig.options = options;
							initAdvanceOptions(vm);
							vm.showAdvance = true;
						}
						else alert("高级搜索异步返回值不是数组格式！options=%s" + JSON.stringify(options));
						vm.advanceConfig.loading = false;
					}).catch(function (error) {
						console.log("[grid] reload error: url=%s, error=%o", vm.url, error);
						var msg = error.message || "加载高级搜索配置失败！";
						if (window["bc"] && bc.msg) bc.msg.alert(msg);
						else alert(msg);

						vm.advanceConfig.loading = false;
					});
				}
			},
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
				this.displayConditions.push({ id: null, operator: '=', value: null, type: null });
			},
			/** 删除条件 */
			deleteCondition: function (index) {
				this.displayConditions.splice(index, 1);
				if (!this.displayConditions.length) {
					this.showAdvance = false;
				}
			},
			/** 清空所有条件 */
			clearCondition: function () {
				this.displayConditions.forEach(function (c) { c.value = "" });
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
			},
			/** 
			 * 获取条件的输入控件类型
			 * 
			 * @param condition {Object} 条件
			 */
			getInputType: function (condition) {
				// string|int|float|double|long|date|month|time|datetime|money
				switch (condition.type) {
					case 'datetime':
						return "datetime-local";
					case 'datetime-local':
						return "datetime-local";
					case 'date':
						return "date";
					case 'month':
						return "month";
					case 'time':
						return "time";
					case 'int':
						return "number";
					case 'float':
						return "number";
					case 'double':
						return "number";
					case 'long':
						return "long";
					case 'money':
						return "number";
					case 'number':
						return "number";
					default:
						return "text";
				}
			}
		}
	});
});