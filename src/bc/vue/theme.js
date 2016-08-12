/**
 * theme component
 * <pre>
 *   usage: <bc-theme [:size="12"] [:unit="px"]></bc-theme>
 * </pre>
 */
define(['jquery', 'vue'], function ($, Vue) {
	'use strict';
	var DEFAULT = {
		UNIT_EM: {
			UNIT: "em",
			SIZE: 1,
			STEP: 0.1,
			MIN: 0.1,
			MAX: 4
		},
		UNIT_PX: {
			UNIT: "px",
			SIZE: 16,
			STEP: 1,
			MIN: 1,
			MAX: 64
		}
	};
	return Vue.component('bc-theme', {
		template: '<div class="ui-widget-content" style="margin:0.2em;padding:0.2em;font-size:16px;position:absolute;right:1em;top:0">' +
		'字体大小：<input type="number" min="{{min}}" max="{{max}}" step="{{step}}" v-model="size"  style="width:3em"/>' +
		'<label><input type="radio" value="em" v-model="unit">em</label>' +
		'<label><input type="radio" value="px" v-model="unit">px</label>' +
		'</div>',
		replace: true,
		props: {
			size: { type: Number, required: false, default: DEFAULT.UNIT_EM.SIZE },
			unit: { type: String, required: false, default: DEFAULT.UNIT_EM.UNIT }
		},
		created: function () {
			this.initByUnit(this.unit);
			if (this.fontSize != DEFAULT.UNIT_EM.SIZE + DEFAULT.UNIT_EM.UNIT)
				this.change();
		},
		data: function () {
			return {
				min: DEFAULT.UNIT_EM.MIN,
				max: DEFAULT.UNIT_EM.MAX,
				step: DEFAULT.UNIT_EM.STEP
			}
		},
		computed: {
			fontSize: function () {
				return this.size + this.unit;
			}
		},
		watch: {
			unit: function (value, old) {
				this.initByUnit(value, old);
			},
			fontSize: function (value, old) {
				this.change();
			}
		},
		methods: {
			initByUnit: function (unit, old) {
				if (unit == "em") {
					this.min = DEFAULT.UNIT_EM.MIN;
					this.max = DEFAULT.UNIT_EM.MAX;
					this.step = DEFAULT.UNIT_EM.STEP;
					if (old) this.size = this.size / 16;
				} else {
					this.min = DEFAULT.UNIT_PX.MIN;
					this.max = DEFAULT.UNIT_PX.MAX;
					this.step = DEFAULT.UNIT_PX.STEP;
					if (old) this.size = this.size * 16;
				}
			},
			change: function () {
				// console.log("[theme] change font-size=%s%s", this.size, this.unit);
				document.body.style.fontSize = this.size + this.unit;
				this.$nextTick(function () {
					this.$dispatch("change-font-size", this.size, this.unit);
				});
			}
		}
	});
});