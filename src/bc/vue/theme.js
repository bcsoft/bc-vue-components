/**
 * theme component
 * <pre>
 *   usage: <bc-theme [:size="12"] [:unit="px"]></bc-theme>
 * </pre>
 */
define(['jquery', 'vue'], function ($, Vue) {
	'use strict';
	return Vue.component('bc-theme', {
		template: '<div class="ui-widget-content" style="margin:0.2em;padding:0.2em;font-size:16px;position:absolute;right:1em;top:0">' +
		'字体大小：<input type="number" min="{{min}}" max="{{max}}" step="{{step}}" v-model="size"  style="width:3em"/>' +
		'<label><input type="radio" value="em" v-model="unit">em</label>' +
		'<label><input type="radio" value="px" v-model="unit">px</label>' +
		'</div>',
		replace: true,
		props: {
			size: { type: Number, required: false, default: 1, twoWay: true },
			unit: { type: String, required: false, default: "em", twoWay: true }
		},
		created: function () {
		},
		data: function () {
			return {
				size: 16,
				unit: "px",
				min: 4,
				max: 24,
				step: 1
			}
		},
		watch: {
			"unit": function (value, old) {
				if (value == "em") {
					this.size = 1;
					this.min = 0.2;
					this.max = 2;
					this.step = 0.1;
				} else {
					this.size = 16;
					this.min = 4;
					this.max = 24;
					this.step = 1;
				}
			},
			"size": function (value, old) {
				//console.log("[theme] change size: new=%s, old=%s", value, old);
				this.change();
			}
		},
		ready: function () {
			if (this.unit == "em") {
				this.min = 0.2;
				this.max = 2;
				this.step = 0.1;
			} else {
				this.min = 1;
				this.max = 32;
				this.step = 1;
			}
			this.change();
		},
		methods: {
			change: function () {
				console.log("[theme] change font-size=%s%s", this.size, this.unit);
				document.body.style.fontSize = this.size + this.unit;
				this.$dispatch("change", this.size, this.unit);
			}
		}
	});
});