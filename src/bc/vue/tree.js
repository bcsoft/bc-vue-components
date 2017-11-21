/**
 * 树组件
 * <pre>
 *   UI 使用：
 *   <bc-tree children="..." :collapsed="false"/>
 * 
 *   参数说明：
 *   <ul>
 *     <li>
 *       1) id {Number, String}: 节点 ID，没有指定时默认为 null，一般只是根节点不指定，子节点必须指定，否则无法判断节点的唯一性。
 *       2) label {String}：节点显示的文字，不指定时默认取 ID 的字符值代替。
 *       3) collapsed {Boolean}：节点的折叠状态，true 为折叠、false 为展开；默认为 true。
 *       4) leaf {Boolean}：是否是叶子节点，默认为 false，代表节点是可展开的。
 *       5) selected {Boolean}：节点是否处于选中状态，默认为 false。
 *       6) paramKey {String}：附加到 url 后的参数名称，默认为 pid。
 *       7) children {Array, String}：子节点列表或获取子节点列表的 URL。
 *         当为 String 时是指定获取子节点数据的 URL（这时也可使用 url 参数名代替 children 进行配置），
 *         当为 Array 时是指定静态的子节点数据列表。
 *           数据格式统一为：[node1, node2, ..., nodeN]
 *             nodeN: {id, label, collapsed, children: [node1, node2, ..., nodeN]} 或单个 ID 值。
 *             如：[2017, 2016, {id: 2015, leaf: false, months: [12, 11, ..., 1]]
 *         当没有配置 children 但 leaf 为 false 时，如果配置了 url 的值，
 *         则每当展开子节点时，都使用 url?pid=:id 的方式远程加载子节点的数据。
 *       8) icon {String} 节点的 jq-ui 图标样式名，非叶子节点默认为文件夹图标、叶子节点默认为文档图标。
 *     </li>
 *   </ul>
 * </pre>
 */
define([
	'jquery', 'vue', 'bc/vue/cors', 'text!bc/vue/tree.html', 'css!bc/vue/tree', 'bc/vue/loading'
], function ($, Vue, CORS, template) {
	'use strict';
	const INDENT = 16;

	// 递归计算节点的深度：顶层节点的深度为 0
	function caculateDepth(node) {
		if (node.$parent && node.$parent.isTreeNode)
			return 1 + caculateDepth(node.$parent);
		else return 0;
	}

	// 获取节点所在树的根节点
	function getRootNode(node) {
		let p = node.$parent;
		if (p && p.isTreeNode) return getRootNode(p);
		else return node;
	}

	// 获取最接近的祖先节点的 url 配置，没有则返回 null
	function getClosestUrl(node) {
		if (!node) return null;
		let s = typeof (node.children) === 'string';
		if (node.isTreeRoot || s) return s ? node.children : null;
		else return getClosestUrl(node.$parent);
	}

	// 获取最接近的祖先节点的 paramKey 配置，没有则返回 'pid'
	function getClosestParamKey(node) {
		if (!node) return 'pid';
		else return node.paramKey ? node.paramKey : getClosestParamKey(node.$parent);
	}

	// 获取最接近的祖先节点的 converter 配置，没有则返回 null
	function getClosestConverter(node) {
		if (!node) return null;
		else return node.converter ? node.converter : getClosestConverter(node.$parent);
	}

	return Vue.component('bc-tree', {
		name: 'bc-tree',
		template: template,
		replace: true,
		props: {
			id: { type: [String, Number], required: false, default: null },
			label: { type: String, required: false, default: null },
			collapsed: { type: Boolean, required: false, default: true },
			selected: { type: Boolean, required: false, default: false },
			icon: { type: String, required: false, default: null },
			leaf: { type: Boolean, required: false, default: false },
			children: { type: [Array, String], required: false, default: null },

			url: { type: String, required: false, default: null }, // children 为 string 的特殊情况
			paramKey: { type: String, required: false, default: null },
			// 节点值转换器，不配置默认使用父节点的 converter
			converter: { type: Function, required: false, default: null },

			// 上述所有配置的综合：尽在组件内部使用
			cfg_: { type: [Object, String, Number], required: false, default: undefined }
		},
		data: function () {
			return {
				isTreeRoot: false,
				isTreeNode: true,
				loading: false,  // 远程数据是否正在加载中
				hover: false,     // 节点是否处于鼠标悬停状态
				items: []         // 子节点数据列表
			}
		},
		computed: {
			// 节点所在的深度：顶层节点的深度为 0
			depth: function () {
				return caculateDepth(this);
			},
			// 节点图标
			iconClass: function () {
				if (this.icon) return this.icon;
				else return this.leaf ? "ui-icon-document" :
					(this.collapsed === false ? "ui-icon-folder-open" : "ui-icon-folder-collapsed");
			}
		},
		ready: function () {
			// 如果使用了综合配置，则拆分到相应的属性中
			if (typeof (this.cfg_) !== 'undefined') {
				let convertedCfg = this.convert(this.cfg_);
				if (typeof (convertedCfg) !== 'object') this.id = convertedCfg;
				else {
					for (let k in convertedCfg) Vue.set(this, k, convertedCfg[k]);
				}
			}

			// 标记自身是否是根节点
			this.isTreeRoot = !this.$parent || (this.$parent && this.$parent.isTreeRoot);

			// 如果设置了 url，则将其转换为 children 配置
			if (this.url) this.children = this.url;

			// 如果设置为选中，则在树根上记录此节点
			if (this.selected) getRootNode(this).selectedNode = this;

			if (Array.isArray(this.children)) {   // 静态数据
				this.items = this.children;
			} else {                              // 远程数据
				if (!this.collapsed) this.load();
			}
		},
		methods: {
			convert: function (cfg) {
				let t = typeof (cfg) === 'object';
				let converter = (t && cfg.converter) ? cfg.converter : getClosestConverter(this);
				return converter ? converter.call(this, cfg) : cfg;
			},
			// 加载子节点列表数据
			load: function () {
				// 避免重复请求
				if (this.loading) {
					console.log("[tree] loading...");
					return;
				}

				let url = getClosestUrl(this);
				if (!url) return;
				if (this.id) {
					let params = {};
					params[getClosestParamKey(this)] = this.id;
					url = CORS.appendUrlParams(url, params);
				}
				CORS.get(url)
					.then(array => {
						this.loading = false;
						this.items = array;
					}).catch(error => {
						this.loading = false;
						console.log("[tree] load error: url=%s, error=%o", url, error);
						var msg = error.message || "[tree] 数据加载失败！";
						if (window['bc'] && bc.msg) bc.msg.alert(msg);
						else alert(msg);
					});
			},
			// 折叠展开节点
			toggle: function () {
				this.collapsed = !this.collapsed;
				if (this.collapsed) return;

				// 远程加载数据
				let url = getClosestUrl(this);
				if (url) this.load();
			},
			// 用户点击节点的处理：选中节点并触发 click-node、change 事件
			clickMe: function () {
				// 触发 click-node 事件
				this.$dispatch("click-node", this);

				if (this.selected) return; // 避免重复触发 change 事件
				this.selected = true;

				// 解除前一选中节点的选择
				let treeRoot = getRootNode(this);
				let preSelectedNode = treeRoot.selectedNode;
				if (preSelectedNode) preSelectedNode.selected = false;

				// 记录当前结点为新的选择节点
				treeRoot.selectedNode = this;

				// 触发 change 事件
				this.$dispatch("change", this, preSelectedNode);
			}
		}
	});
});