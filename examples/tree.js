define(["vue", "bc/vue/tree"], function (Vue) {
	"use strict";
	return new Vue({
		el: document.body,
		data: {
			treeArrayData: [
				{ id: 2018, label: '2018 年' },
				{
					id: 2017,
					label: '2017 年',
					collapsed: false,
					children: [
						{
							id: 11, 
							label: '11 月',
							collapsed: false,
							children: [
								{ id: 8, label: '8 日', leaf: true },
								{ id: 9, label: '9 日', leaf: true, selected: true },
								{ id: 10, label: '10 日', leaf: true }
							]
						},
						{ id: 10 },
						{ id: 9, label: '9 月' }
					]
				},
				{ id: 2016, label: '长名称自动换行自动换行' },
				{ id: 2015, label: '2015 年' }
			],
			treeUrl: '/data/tree.json'
		},
		methods: {
			onChangeNode: function (newNode, oldNode) {
				console.log("change: newNode.id=%s, oldNode.id=%s", newNode.id, oldNode ? oldNode.id : null);
			},
			onClickNode: function (node) {
				console.log("click-node: node.id=" + node.id);
			},
			converter: function(cfg){
				if(typeof (cfg) === 'number') return {id: cfg, leaf: true};
				else return cfg;
			}
		}
	});
});