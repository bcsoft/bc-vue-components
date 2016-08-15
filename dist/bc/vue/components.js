/*! BC 平台的 vue 组件
 * @author dragon <rongjihuang@gmail.com>
 * @version v0.2.0 2016-08-15
 * @license Apache License 2.0
 * @components bc-theme
 *             bc-button
 *             bc-button-set
 *             bc-search
 *             bc-toolbar
 *             bc-table-col
 *             bc-page-bar
 *             bc-loading
 *             bc-grid
 * @history v0.1.0 2016-07-08
 */

define("bc/vue/theme", [ "jquery", "vue" ], function($, Vue) {
    "use strict";
    var DEFAULT = {
        UNIT_EM: {
            UNIT: "em",
            SIZE: 1,
            STEP: .1,
            MIN: .1,
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
    return Vue.component("bc-theme", {
        template: '<div class="ui-widget-content" style="margin:0.2em;padding:0.2em;font-size:16px;position:absolute;right:1em;top:0">字体大小：<input type="number" min="{{min}}" max="{{max}}" step="{{step}}" v-model="size"  style="width:3em"/><label><input type="radio" value="em" v-model="unit">em</label><label><input type="radio" value="px" v-model="unit">px</label></div>',
        replace: !0,
        props: {
            size: {
                type: Number,
                required: !1,
                "default": DEFAULT.UNIT_EM.SIZE
            },
            unit: {
                type: String,
                required: !1,
                "default": DEFAULT.UNIT_EM.UNIT
            }
        },
        created: function() {
            this.initByUnit(this.unit), this.fontSize != DEFAULT.UNIT_EM.SIZE + DEFAULT.UNIT_EM.UNIT && this.change();
        },
        data: function() {
            return {
                min: DEFAULT.UNIT_EM.MIN,
                max: DEFAULT.UNIT_EM.MAX,
                step: DEFAULT.UNIT_EM.STEP
            };
        },
        computed: {
            fontSize: function() {
                return this.size + this.unit;
            }
        },
        watch: {
            unit: function(value, old) {
                this.initByUnit(value, old);
            },
            fontSize: function(value, old) {
                this.change();
            }
        },
        methods: {
            initByUnit: function(unit, old) {
                "em" == unit ? (this.min = DEFAULT.UNIT_EM.MIN, this.max = DEFAULT.UNIT_EM.MAX, 
                this.step = DEFAULT.UNIT_EM.STEP, old && (this.size = this.size / 16)) : (this.min = DEFAULT.UNIT_PX.MIN, 
                this.max = DEFAULT.UNIT_PX.MAX, this.step = DEFAULT.UNIT_PX.STEP, old && (this.size = 16 * this.size));
            },
            change: function() {
                document.body.style.fontSize = this.size + this.unit, this.$nextTick(function() {
                    this.$dispatch("change-font-size", this.size, this.unit);
                });
            }
        }
    });
}), define("bc/vue/button", [ "jquery", "vue" ], function($, Vue) {
    "use strict";
    return Vue.component("bc-button", {
        template: '<button class="bc-vue-button ui-button ui-widget ui-state-default ui-corner-all" style="font-family:inherit" type="button" :class="btnClass"><span class="ui-button-icon-primary ui-icon" v-if="iconClass" :class="iconClass"></span><span class="ui-button-text">{{text}}<slot></slot></span></button>',
        replace: !0,
        props: {
            text: {
                type: String,
                required: !1,
                "default": "　"
            },
            iconClass: {
                type: String,
                required: !1
            }
        },
        computed: {
            btnClass: function() {
                var c, hasText = this.text && "　" != this.text;
                return c = hasText && this.iconClass ? "ui-button-text-icon-primary" : !hasText && this.iconClass ? "ui-button-icon-only" : (hasText && !this.iconClass, 
                "ui-button-text-only");
            }
        },
        ready: function() {
            var $el = $(this.$el);
            $el.on({
                mouseover: function() {
                    $(this).addClass("ui-state-hover");
                },
                mouseout: function() {
                    $(this).removeClass("ui-state-hover");
                }
            });
        },
        beforeDestroy: function() {
            $(this.$el).off();
        },
        methods: {}
    });
}), define("bc/vue/button-set", [ "jquery", "vue" ], function($, Vue) {
    "use strict";
    return Vue.component("bc-button-set", {
        template: '<div class="bc-vue-button-set ui-buttonset" style="display:inline-block"><div v-for="i in items" data-id="{{i.hasOwnProperty(\'id\') ? i.id : $index}}" class="ui-button ui-widget ui-state-default ui-button-text-only" style="font-family:inherit"' + " :class=\"{'ui-corner-left': $index == 0, 'ui-corner-right': $index == items.length - 1, 'ui-state-active': isActive(i)}\" :style=\"{'margin-right': '-1px', 'z-index': value == i.id ? items.length : 0}\"><span class=\"ui-button-text\" @click=\"clickItem(i, $index)\">{{i.label || i}}</span></div></div>",
        replace: !0,
        props: {
            items: {
                type: Array,
                required: !0
            },
            value: {
                required: !1,
                "default": null
            }
        },
        created: function() {
            if (null === this.value) for (var i = 0; i < this.items.length; i++) if (this.items[i].active) {
                this.value = this.items[i].id;
                break;
            }
        },
        watch: {
            value: function(value, old) {
                this.$dispatch("change", value, old);
            }
        },
        methods: {
            clickItem: function(item, index) {
                this.value = "object" == typeof item ? item.id : item;
            },
            isActive: function(item) {
                return "object" == typeof item ? this.value == item.id : this.value == item;
            }
        }
    });
}), define("text!bc/vue/search.html", [], function() {
    return '<div class="bc-vue-search">\r\n	<div class="fuzzy" :style="{\'text-align\': align}">\r\n		<div>\r\n			<span @click.stop="search" class="search ui-icon ui-icon-search" title="执行查询"></span>\r\n			<input debounce="200" @keyup.enter.stop="search" type="text" v-model="fuzzyValue" class="fuzzy ui-widget-content" :placeholder="placeholder" @change.stop>\r\n			<span v-if="advance && advance.length" @click.stop="addCondition" class="add ui-icon ui-icon-plusthick" title="添加特定条件"></span>\r\n		</div>\r\n	</div>\r\n	<div class="advance ui-widget-content" v-if="showAdvance">\r\n		<table cellspacing="0" cellpadding="0">\r\n			<tbody>\r\n				<tr v-for="c in displayList" class="condition">\r\n					<td class="ui-widget-content">\r\n						<select class="id ui-widget-content" v-model="c.id" @change.stop="editCondition(\'id\', c)">\r\n							<option v-for="cfg in advance" :value="cfg.id">{{cfg.label}}</option>\r\n						</select>\r\n					</td>\r\n					<td class="ui-widget-content">\r\n						<select class="operator ui-widget-content" v-model="c.operator" @change.stop="editCondition(\'operator\', c)">\r\n							<option v-for="o in operators(c.id)" :value="o.id">{{o.label}}</option>\r\n						</select>\r\n					</td>\r\n					<td class="ui-widget-content">\r\n						<input debounce="200" type="text" class="value ui-widget-content" v-model="c.value" @keyup.enter.stop="search" @change.stop="editCondition(\'value\', c)">\r\n					</td>\r\n					<td class="ui-widget-content">\r\n						<span @click.stop="deleteCondition($index)" class="delete ui-icon ui-icon-minusthick" title="移除此条件"></span>\r\n					</td>\r\n				</tr>\r\n			</tbody>\r\n		</table>\r\n	</div>\r\n</div>';
}), define("css!bc/vue/search", [], function() {}), define("bc/vue/search", [ "vue", "text!bc/vue/search.html", "css!bc/vue/search" ], function(Vue, template) {
    "use strict";
    var FUZZY_ID = "_fuzzy_";
    return Vue.component("bc-search", {
        template: template,
        replace: !0,
        props: {
            placeholder: {
                type: String,
                required: !1
            },
            align: {
                type: String,
                required: !1,
                "default": "left"
            },
            quick: {
                type: Boolean,
                required: !1,
                "default": !1
            },
            simple: {
                type: Boolean,
                required: !1,
                "default": void 0
            },
            value: {
                type: [ String, Array, Object ],
                required: !1
            },
            advance: {
                type: Array,
                required: !1,
                "default": function() {
                    return [];
                }
            }
        },
        data: function() {
            return {
                displayList: [],
                showAdvance: !1,
                fuzzyValue: ""
            };
        },
        computed: {
            fuzzyValueObj: function() {
                return null !== this.fuzzyValue && "" !== this.fuzzyValue ? {
                    id: FUZZY_ID,
                    value: this.fuzzyValue
                } : null;
            },
            defaultDisplayList: function() {
                var list = [];
                if (this.advance) for (var i = 0; i < this.advance.length; i++) this.advance[i]["default"] && list.push({
                    id: this.advance[i].id,
                    value: this.advance[i].value,
                    operator: this.advance[i].operator || "="
                });
                return list;
            },
            advanceValue: function() {
                if (!this.showAdvance || !this.advance || !this.advance.length) return [];
                for (var d, cfg, vc = [], i = 0; i < this.displayList.length; i++) d = this.displayList[i], 
                d.id && d.operator && d.value && (cfg = this.getConditionConfig(d.id), vc.push({
                    id: d.id,
                    value: d.value,
                    type: cfg.type || "string",
                    operator: d.operator,
                    label: cfg.label
                }));
                return vc;
            },
            advanceValueStr: function() {
                return JSON.stringify(this.advanceValue);
            },
            value_: function() {
                return 0 == this.advanceValue.length ? this.simple ? this.fuzzyValue : this.fuzzyValueObj : this.fuzzyValueObj ? [].concat(this.advanceValue, this.fuzzyValueObj) : [].concat(this.advanceValue);
            }
        },
        created: function() {
            "undefined" == typeof this.simple && (this.simple = !(this.advance && this.advance.length)), 
            "string" == typeof this.value && (this.fuzzyValue = this.value), this.$watch("fuzzyValue", function(value, old) {
                this.change();
            });
        },
        watch: {
            advance: function(value, old) {
                this.showAdvance = !1, this.initDisplayList();
            },
            advanceValueStr: function(value, old) {
                this.change();
            }
        },
        methods: {
            change: function() {
                this.value = this.value_, this.$dispatch("change", this.value), this.quick && this.$dispatch("search", this.value);
            },
            search: function() {
                this.$dispatch("search", this.value_);
            },
            initDisplayList: function() {
                this.displayList.length = 0;
                for (var i = 0; i < this.defaultDisplayList.length; i++) this.displayList.push({
                    id: this.defaultDisplayList[i].id,
                    value: this.defaultDisplayList[i].value,
                    operator: this.defaultDisplayList[i].operator
                });
            },
            operators: function(id) {
                var operators = [ {
                    id: "=",
                    label: "等于"
                }, {
                    id: ">",
                    label: "大于"
                }, {
                    id: "<",
                    label: "小于"
                }, {
                    id: "<>",
                    label: "不等于"
                }, {
                    id: "<=",
                    label: "不大于"
                }, {
                    id: ">=",
                    label: "不小于"
                } ], cfg = this.getConditionConfig(id);
                return cfg && cfg.type && "string" != cfg.type || operators.push({
                    id: "@",
                    label: "包含"
                }), operators;
            },
            addCondition: function() {
                this.showAdvance ? this.displayList.push({
                    operator: "="
                }) : (this.initDisplayList(), this.showAdvance = !0);
            },
            deleteCondition: function(index) {
                this.displayList.splice(index, 1), this.displayList.length || (this.showAdvance = !1);
            },
            getConditionConfig: function(id) {
                if (this.advance) for (var i = 0; i < this.advance.length; i++) if (this.advance[i].id == id) return this.advance[i];
                return null;
            },
            editCondition: function(type, condition) {
                "id" == type && (condition.value = null);
            }
        }
    });
}), define("css!bc/vue/toolbar", [], function() {}), define("bc/vue/toolbar", [ "vue", "css!bc/vue/toolbar" ], function(Vue) {
    "use strict";
    return Vue.component("bc-toolbar", {
        template: '<div class="bc-vue-toolbar ui-widget-content"><slot></slot></div>',
        replace: !0,
        props: {}
    });
}), define("bc/vue/table-col", [ "vue" ], function(Vue) {
    "use strict";
    return Vue.component("bc-table-col", {
        template1: '<colgroup data-rowspan={{rowspan}}><col v-if="addSn" data-id="_sn" style="width:3em"><col v-for="c in columns" data-id="{{c.id}}" :style="{width:c.width}"><col v-if="addEmpty" data-id="_empty" style="width:auto;min-width:1em;"></colgroup>',
        template: '<colgroup v-if="addSn" data-id="_sn" style="width:3em"></colgroup><colgroup v-for="c in columns" data-id="{{c.id}}" :style="{width:c.width}" span="{{c.children ? c.children.length || 1 : 1}}"><col v-if="c.children" v-for="d in c.children" data-id="{{d.id}}" :style="{width:d.width}"></colgroup><colgroup v-if="addEmpty" data-id="_empty" style="width:auto;min-width:1em;"></colgroup>',
        replace: !0,
        props: {
            columns: {
                type: Array,
                required: !0
            },
            addSn: {
                type: Boolean,
                required: !1,
                "default": !1
            },
            addEmpty: {
                type: Boolean,
                required: !1,
                "default": !1
            }
        },
        computed: {
            rowspan: function() {
                for (var rowspan = 1, i = 0; i < this.columns.length; i++) if (this.columns[i].children && this.columns[i].children.length) {
                    rowspan = 2;
                    break;
                }
                return rowspan;
            }
        }
    });
}), define("text!bc/vue/page-bar.html", [], function() {
    return '<ul class="bc-page-bar ui-widget-content ui-widget ui-helper-clearfix">\r\n	<li v-if="refreshable" class="icon ui-state-default ui-corner-all" title="刷新" @click="this.$dispatch(\'change\', \'clickRefresh\', this.pageNo, this.pageSize)">\r\n		<span class="ui-icon ui-icon-refresh"></span>\r\n	</li>\r\n	<template v-if="pageable">\r\n		<li class="icons ui-state-default ui-corner-all">\r\n			<a href="#" class="icon ui-state-default ui-corner-all" @click="toPage(1)">\r\n				<span class="ui-icon ui-icon-seek-first" title="首页"></span>\r\n			</a>\r\n			<a href="#" class="icon ui-state-default ui-corner-all" @click="toPage(Math.max(this.pageNo - 1, 1))">\r\n				<span class="ui-icon ui-icon-seek-prev" title="上一页"></span>\r\n			</a>\r\n			<span class="pageNo">\r\n				<span>{{pageNo}}</span>/<span>{{pageCount}}</span>(<span>{{count}}</span>)\r\n			</span>\r\n			<a href="#" class="icon ui-state-default ui-corner-all" @click="toPage(Math.min(this.pageNo + 1, this.pageCount))">\r\n				<span class="ui-icon ui-icon-seek-next" title="下一页"></span>\r\n			</a>\r\n			<a href="#" class="icon ui-state-default ui-corner-all" @click="toPage(this.pageCount)">\r\n				<span class="ui-icon ui-icon-seek-end" title="尾页"></span>\r\n			</a>\r\n		</li>\r\n		<li class="icons ui-state-default ui-corner-all" title="每页显示的数量">\r\n			<a href="#" v-for="s in pageSizes" class="icon ui-state-default ui-corner-all" :class="{\'ui-state-active\': pageSize == s}" @click="changePageSize(s)">\r\n				<span class="pageSize">{{s}}</span>\r\n			</a>\r\n		</li>\r\n	</template>\r\n	<li v-if="exportable" class="icon ui-state-default ui-corner-all" title="导出" @click="this.$dispatch(\'export\', -1)">\r\n		<span class="ui-icon ui-icon-arrowthickstop-1-s"></span>\r\n	</li>\r\n	<li v-if="importable" class="icon ui-state-default ui-corner-all" title="导入" @click="this.$dispatch(\'import\')">\r\n		<span class="ui-icon ui-icon-arrowthickstop-1-n"></span>\r\n	</li>\r\n</ul>';
}), define("css!bc/vue/page-bar", [], function() {}), define("bc/vue/page-bar", [ "jquery", "vue", "text!bc/vue/page-bar.html", "css!bc/vue/page-bar" ], function($, Vue, template) {
    "use strict";
    var DEFAULT_PAGE_SIZES = [ 25, 50, 100 ];
    return Vue.component("bc-page-bar", {
        template: template,
        replace: !0,
        props: {
            pageable: {
                type: Boolean,
                required: !1,
                "default": !1
            },
            pageNo: {
                type: Number,
                required: !1,
                "default": 1
            },
            pageSize: {
                type: Number,
                required: !1,
                "default": DEFAULT_PAGE_SIZES[0]
            },
            pageSizes: {
                type: Array,
                required: !1,
                "default": function() {
                    return DEFAULT_PAGE_SIZES;
                }
            },
            count: {
                type: Number,
                required: !1,
                "default": 0
            },
            refreshable: {
                type: Boolean,
                required: !1,
                "default": !0
            },
            exportable: {
                type: Boolean,
                required: !1,
                "default": !1
            },
            importable: {
                type: Boolean,
                required: !1,
                "default": !1
            }
        },
        data: function() {
            return {
                pageCount: Math.ceil(this.count / this.pageSize)
            };
        },
        ready: function() {
            var $el = $(this.$el);
            $el.on({
                mouseover: function() {
                    $(this).addClass("ui-state-hover");
                },
                mouseout: function() {
                    $(this).removeClass("ui-state-hover");
                }
            }, ".icon");
        },
        beforeDestroy: function() {
            $(this.$el).off();
        },
        watch: {
            count: function(val, oldVal) {
                this.pageCount = Math.ceil(val / this.pageSize);
            }
        },
        methods: {
            toPage: function(pageNo) {
                pageNo = Math.max(1, pageNo), pageNo != this.pageNo && (this.pageNo = pageNo, this.$dispatch("change", "changePageNo", this.pageNo, this.pageSize));
            },
            changePageSize: function(pageSize) {
                pageSize != this.pageSize && (this.pageNo = this.pageNo < 2 ? this.pageNo : Math.floor((this.pageNo - 1) * this.pageSize / pageSize + 1), 
                this.pageSize = pageSize, this.pageCount = Math.ceil(this.count / this.pageSize), 
                this.$dispatch("change", "changePageSize", this.pageNo, this.pageSize));
            }
        }
    });
}), define("css!bc/vue/loading", [], function() {}), define("bc/vue/loading", [ "vue", "css!bc/vue/loading" ], function(Vue) {
    "use strict";
    return Vue.component("bc-loading", {
        template: '<div class="bc-vue-loading-container ui-overlay"><div v-if="maskable" class="mask ui-widget-overlay"></div><div class="actor ui-state-active"' + " :style=\"{'width': size, 'height': size, 'animation-duration': speed, 'margin-top': 'calc('+ size + ' / -2)', 'margin-left': 'calc('+ size + ' / -2)'}\" :class=\"{transparent: transparent}\"></div><div v-if=\"countable\" class=\"counter ui-state-disabled\">{{minutes_}} : {{seconds_}}</div></div>",
        replace: !0,
        props: {
            size: {
                type: String,
                required: !1,
                "default": "4.5em"
            },
            speed: {
                type: String,
                required: !1,
                "default": "1s"
            },
            maskable: {
                type: Boolean,
                required: !1,
                "default": !0
            },
            countable: {
                type: Boolean,
                required: !1,
                "default": !1
            },
            transparent: {
                type: Boolean,
                required: !1,
                "default": !0
            }
        },
        data: function() {
            return {
                counter: 0,
                minutes: 0,
                seconds: 0
            };
        },
        computed: {
            minutes_: function() {
                return this.minutes < 10 ? "0" + this.minutes : "" + this.minutes;
            },
            seconds_: function() {
                return this.seconds < 10 ? "0" + this.seconds : "" + this.seconds;
            }
        },
        ready: function() {
            var self = this, max = 11;
            setInterval(function() {
                self.seconds++, self.seconds == max && (self.seconds = 0, self.minutes++, self.minutes == max && (self.minutes = 0));
            }, 1e3);
        },
        methods: {
            reset: function() {
                this.minutes = 0, this.seconds = 0;
            }
        }
    });
}), define("text!bc/vue/grid.html", [], function() {
    return '<div class="bc-vue-grid ui-widget-content">\r\n	<!-- 顶部扩展区 -->\r\n	<slot name="top"></slot>\r\n\r\n	<!-- 表头 -->\r\n	<table class="head" :style="{width:\'100%\',position:\'relative\',\'user-select\':\'initial\',left:v.scrollLeft + \'px\'}">\r\n		<colgroup v-ref:cols is="bc-table-col" :columns="columns" :add-sn="true" :add-empty="true">\r\n		</colgroup>\r\n		<thead>\r\n			<tr class="main head ui-widget-content">\r\n				<th rowspan="{{headRowspan}}" data-id="_sn" class="sn"><input type="checkbox" v-if="!singleChoice" v-model="v.selectAll" title="{{v.selectAll ? \'点击全部不选择\' : \'点击选择全部\'}}" @change.stop></th>\r\n				<th v-for="c in columns" class="cell text" :class="c.headCellClass" :style="c.headCellStyle" data-id="{{c.id}}" colspan="{{c.children && c.children.length > 0 ? c.children.length : 1}}" rowspan="{{c.children && c.children.length > 0 ? 1 : headRowspan}}">{{c.label}}</th>\r\n				<th rowspan="{{headRowspan}}" data-id="_empty" class="empty"></th>\r\n			</tr>\r\n			<!-- 分组的表头 -->\r\n			<tr class="sub head ui-widget-content" v-if="headRowspan > 1">\r\n				<template v-for="c in columns | filterBy isGroupColumn">\r\n					<th v-for="d in c.children" class="cell text" data-id="{{d.id}}">{{d.label}}</th>\r\n				</template>\r\n			</tr>\r\n		</thead>\r\n	</table>\r\n\r\n	<!-- 数据 -->\r\n	<div class="rows" :style="{overflow:\'auto\',\'user-select\':\'initial\'}" @scroll="v.scrollLeft = -1 * $event.target.scrollLeft">\r\n		<table class="rows" style="width:100%">\r\n			<colgroup is="bc-table-col" :columns="columns" :add-sn="true" :add-empty="true"></colgroup>\r\n			<tbody>\r\n				<tr class="row" v-for="r in rows" data-id="{{r.id}}" class="{{r.class}}" :class="{\'ui-state-highlight\': r.selected, \'ui-widget-content\': true}" :style="r.style">\r\n					<td class="sn" data-id="_sn"><span v-if="r.selected" class="ui-icon ui-icon-check"></span>{{$index + 1}}</td>\r\n					<template v-for="c in columns">\r\n						<td v-if="isGroupColumn(c)" v-for="d in c.children" class="cell text" :class="d.rowCellClass" :style="d.rowCellStyle" data-id="{{d.id}}">{{r[d.id]}}</td>\r\n						<td v-if="!isGroupColumn(c)" class="cell text" :class="c.rowCellClass" :style="c.rowCellStyle" data-id="{{c.id}}">{{r[c.id]}}</td>\r\n					</template>\r\n					<td class="empty" data-id="_empty"></td>\r\n				</tr>\r\n			</tbody>\r\n		</table>\r\n	</div>\r\n\r\n	<!-- 分页条 -->\r\n	<bc-page-bar v-if="showPageBar" style="border-width: 1px 0 0 0" :pageable="pageable" :page-no.sync="pageNo" :page-size.sync="pageSize" :page-sizes.sync="pageSizes" :count.sync="count" :refreshable="refreshable" :exportable="exportable" :importable="importable" @change="reload">\r\n	</bc-page-bar>\r\n\r\n	<!-- 加载器 -->\r\n	<bc-loading v-ref:loading v-if="v.loading"></bc-loading>\r\n\r\n	<!-- 底部扩展区 -->\r\n	<slot name="bottom"></slot>\r\n</div>';
}), define("css!bc/vue/grid", [], function() {}), define("bc/vue/grid", [ "jquery", "vue", "bc/vue/table-col", "bc/vue/page-bar", "text!bc/vue/grid.html", "css!bc/vue/grid", "bc/vue/loading" ], function($, Vue, tableCol, pageBar, template) {
    "use strict";
    var DEFAULT_PAGE_SIZES = [ 25, 50, 100 ];
    return Vue.component("bc-grid", {
        template: template,
        replace: !0,
        props: {
            singleChoice: {
                type: Boolean,
                required: !1,
                "default": !1
            },
            columns: {
                type: Array,
                required: !1,
                "default": function() {
                    return [];
                }
            },
            rows: {
                type: Array,
                required: !1,
                "default": function() {
                    return [];
                }
            },
            url: {
                type: String,
                required: !1
            },
            query: {
                required: !1
            },
            showPageBar: {
                type: Boolean,
                required: !1,
                "default": !0
            },
            pageable: {
                type: Boolean,
                required: !1,
                "default": !1
            },
            pageNo: {
                type: Number,
                required: !1,
                "default": 1
            },
            pageSize: {
                type: Number,
                required: !1,
                "default": DEFAULT_PAGE_SIZES[0]
            },
            pageSizes: {
                type: Array,
                required: !1,
                "default": function() {
                    return DEFAULT_PAGE_SIZES;
                }
            },
            count: {
                type: Number,
                required: !1,
                "default": 0
            },
            refreshable: {
                type: Boolean,
                required: !1,
                "default": !0
            },
            exportable: {
                type: Boolean,
                required: !1,
                "default": !1
            },
            importable: {
                type: Boolean,
                required: !1,
                "default": !1
            },
            autoLoad: {
                type: Boolean,
                required: !1,
                "default": !0
            }
        },
        computed: {
            selection: function() {
                if (!this.singleChoice) {
                    for (var ss = [], i = 0; i < this.rows.length; i++) this.rows[i].selected && ss.push(this.rows[i]);
                    return ss;
                }
                for (var i = 0; i < this.rows.length; i++) if (this.rows[i].selected) return this.rows[i];
            },
            headRowspan: function() {
                return this.$refs.cols ? this.$refs.cols.rowspan : 1;
            }
        },
        data: function() {
            return {
                v: {
                    scrollLeft: 0,
                    loading: !1,
                    selectAll: !1
                }
            };
        },
        watch: {
            "v.selectAll": function(value, old) {
                var vm = this;
                this.rows.forEach(function(row, index) {
                    row.hasOwnProperty("selected") ? row.selected = value : vm.$set("rows[" + index + "].selected", value);
                });
            }
        },
        ready: function() {
            var delaying, timer, cancelClick, $el = $(this.$el), vm = this;
            $el.on({
                mouseover: function() {
                    $(this).addClass("ui-state-hover");
                },
                mouseout: function() {
                    $(this).removeClass("ui-state-hover");
                },
                click: function() {
                    delaying && clearTimeout(timer), delaying = !0;
                    var rowIndex = this.rowIndex;
                    timer = setTimeout(function() {
                        if (delaying = !1, cancelClick) return void (cancelClick = !1);
                        if (vm.singleChoice) for (var i = 0; i < vm.rows.length; i++) i != rowIndex && vm.rows[i].selected && (vm.rows[i].selected = !1);
                        var row = vm.rows[rowIndex];
                        row.hasOwnProperty("selected") ? vm.rows[rowIndex].selected = !vm.rows[rowIndex].selected : vm.$set("rows[" + rowIndex + "].selected", !0), 
                        delaying = !1;
                    }, 200);
                },
                dblclick: function() {
                    cancelClick = !0, vm.$dispatch("dblclick-row", vm.rows[this.rowIndex], this.rowIndex);
                }
            }, "tr.row"), this.autoLoad && this.reload();
        },
        methods: {
            changePageBar: function(type, pageNo, pageSize) {
                this.reload();
            },
            reload: function() {
                if (this.url) {
                    this.v.loading = !0;
                    var params = {
                        pageNo: this.pageNo,
                        pageSize: this.pageSize
                    };
                    this.query && (Array.isArray(this.query) ? params.query = JSON.stringify(this.query) : "object" == typeof this.query ? Object.assign(params, this.query) : "string" == typeof this.query && (params.query = this.query));
                    var vm = this;
                    $.getJSON(this.url, params).then(function(j) {
                        j.columns && vm.$set("columns", j.columns), j.rows && vm.$set("rows", j.rows), vm.pageable && (j.pageNo && vm.$set("pageNo", j.pageNo), 
                        j.pageSize && vm.$set("pageSize", j.pageSize), j.pageSizes && vm.$set("pageSizes", j.pageSizes), 
                        j.count && vm.$set("count", j.count)), vm.showPageBar && (j.hasOwnProperty("refreshable") && vm.$set("refreshable", j.refreshable), 
                        j.hasOwnProperty("exportable") && vm.$set("exportable", j.exportable), j.hasOwnProperty("importable") && vm.$set("importable", j.importable)), 
                        j.hasOwnProperty("singleChoice") && vm.$set("singleChoice", j.singleChoice);
                    }, function(error) {
                        console.log("[grid] reload error: url=%s, error=%o", vm.url, error), alert("[grid] 数据加载失败！");
                    }).always(function() {
                        vm.v.loading = !1;
                    });
                }
            },
            isGroupColumn: function(column) {
                return !(!column.children || !column.children.length);
            }
        }
    });
}), define("bc/vue/components", [ "bc/vue/theme", "bc/vue/button", "bc/vue/button-set", "bc/vue/search", "bc/vue/toolbar", "bc/vue/table-col", "bc/vue/page-bar", "bc/vue/loading", "bc/vue/grid" ], function() {
    return 0;
}), function(c) {
    var d = document, a = "appendChild", i = "styleSheet", s = d.createElement("style");
    s.type = "text/css", d.getElementsByTagName("head")[0][a](s), s[i] ? s[i].cssText = c : s[a](d.createTextNode(c));
}(".bc-vue-search{position:relative;display:inline-block;}.bc-vue-search > .fuzzy > div{display:inline-block;position:relative;}.bc-vue-search > .fuzzy .search{position:absolute;top:50%;margin-top:-8px;left:2px;cursor:pointer;}.bc-vue-search > .fuzzy input.fuzzy{box-sizing:border-box;padding:.4em 18px;width:12em;height:2.5em;font-family:inherit;font-size:1em;}.bc-vue-search > .fuzzy .add{position:absolute;top:50%;margin-top:-8px;right:2px;cursor:pointer;}.bc-vue-search > .advance{position:relative;margin-top:-1px;background-image:none;background-color:rgba(255,255,255,0.8);z-index:90;max-height:18em;overflow:auto;}.bc-vue-search > .advance > table{border-collapse:collapse;margin:0.4em;border:0;}.bc-vue-search .condition{position:relative;margin:0.4em;}.bc-vue-search .condition > td{vertical-align:middle;}.bc-vue-search .condition > td > *{padding:.4em;height:2.5em;font-family:inherit;font-size:1em;box-sizing:border-box;border-width:0;}.bc-vue-search .condition .id{min-width:5em;text-align:right;}.bc-vue-search .condition .operator{text-align:center;}.bc-vue-search .condition .value{width:10em;text-align:left;}.bc-vue-search .condition .delete{cursor:pointer;height:16px;}.bc-vue-toolbar{position:relative;padding:0;min-height:2em;word-spacing:-0.4em;font-weight:normal;}.bc-vue-toolbar > *{word-spacing:normal;font-family:inherit;margin:0.2em;}.bc-vue-toolbar > .bc-vue-search{position:absolute;top:0.05em;right:0.05em;}.bc-page-bar{clear:both;display:block;margin:0;padding:0;}.bc-page-bar li{list-style:none;cursor:default;position:relative;margin:0.2em;padding:4px 0;float:left;}.bc-page-bar .icon{cursor:pointer;}.bc-page-bar li span.ui-icon{float:left;margin:0 4px;}.bc-page-bar .icons{padding:2px 2px;}.bc-page-bar .icons a.icon{margin:0;border:0;}.bc-page-bar .icons span.ui-icon{margin:2px;}.bc-page-bar li span.pageNo,.bc-page-bar li span.pageSize{float:left;height:16px;font-size:12px;}.bc-page-bar li span.pageNo{margin:2px 4px;cursor:default;}.bc-page-bar li span.pageSize{margin:2px 4px;}.bc-page-bar li a{float:left;display:block;}.bc-vue-loading-container{position:absolute;top:0;left:0;width:100%;height:100%;}.bc-vue-loading-container > .counter,.bc-vue-loading-container > .actor{position:absolute;box-sizing:border-box;top:50%;left:50%;}.bc-vue-loading-container > .counter{width:6em;height:2em;line-height:2em;text-align:center;margin:-1em auto auto -3em;border:none;background:none;}.bc-vue-loading-container > .actor{opacity:0.8;width:3.5em;height:3.5em;margin:-1.75em auto auto -1.75em;border-width:0.5em;border-radius:50%;border-left-color:transparent;border-right-color:transparent;animation:bc-vue-loading-spin 1000ms infinite linear;}.bc-vue-loading-container > .actor.transparent{background:none;}@keyframes bc-vue-loading-spin{100%{transform:rotate(360deg);transform:rotate(360deg);}}.bc-page > .bc-vue-grid,.bc-vue-grid.fillup{position:absolute;top:0;bottom:0;left:0;right:0;overflow:hidden;}.bc-page > .bc-vue-grid,.bc-vue-grid.noborder{border-width:0;}.bc-vue-grid.border{border-width:1px;}.bc-vue-grid > .bc-vue-toolbar{border-width:0 0 1px 0;}.bc-vue-grid{display:flex;flex-direction:column;overflow:hidden;box-sizing:border-box;position:relative;font-weight:normal;}.bc-vue-grid > *{flex:none;}.bc-vue-grid > div.rows{flex:1 1 0%;}.bc-vue-grid table.head,.bc-vue-grid table.rows{table-layout:fixed;border-collapse:collapse;}.bc-vue-grid table.rows{margin-bottom:-1px;}.bc-vue-grid tr.head > th{font-weight:inherit;}.bc-vue-grid tr.head,.bc-vue-grid tr.row{height:2em;}.bc-vue-grid td.cell{text-align:left;white-space:normal;word-wrap:break-word;word-break:break-all;}.bc-vue-grid td.sn{text-align:center;cursor:default;}.bc-vue-grid td.sn > .ui-icon-check{display:inline-block;}.bc-vue-grid tr.main.head,.bc-vue-grid tr.row{border-width:1px 0 1px 0;}.bc-vue-grid tr.main.head:first-child,.bc-vue-grid tr.row:first-child,.bc-vue-grid tr.main.head:first-child > th,.bc-vue-grid tr.row:first-child > td{border-top:none;}.bc-vue-grid tr.main.head >:first-child,.bc-vue-grid tr.row >:first-child{border-left:none;}.bc-vue-grid tr.main.head >:last-child,.bc-vue-grid tr.row >:last-child{border-right:none;}.bc-vue-grid tr.head > *,.bc-vue-grid tr.row > *{padding:0;border-width:1px;border-color:inherit;border-style:inherit;}.bc-vue-grid td.cell.text,.bc-vue-grid th.cell.text{padding:0 0.4em;}");