/**
 * 分页条的导入组件
 * <pre>
 *   UI 使用：
 *   <bc-page-bar-importer [title="导入"] [url="..."] [tpl-url="..."]/>
 * 
 *   参数说明：
 *   <ul>
 *     <li>title {String} [可选] 按钮的鼠标提示文字，默认为 “导入”</li>
 *     <li>iconClass {String} [可选] 按钮的图标样式，默认为 “ui-icon-arrowthickstop-1-n”</li>
 *     <li>width {String} [可选] box-pointer 的宽度，默认为 'auto'</li>
 *     <li>hidden {Boolean} [可选] 是否隐藏不显示 box-pointer，默认为 true</li>
 *     <li>tplUrl {String} [必须] 下载模板的 URL</li>
 *     <li>tplFilename {String} [必须] 下载模板的文件名，不指定使用则使用响应头中的值</li>
 *     <li>accept {String} [可选] 上传数据时可选择的文件类型，默认为 ".xls,.xlsx"</li>
 *     <li>imported {Event} 导入完毕后的事件，
 *           第 1 个参数为代表导入是否全部成功的标记（(status=2xx && errorCount=0) or status!=2xx），
 *           第 2 个参数为服务器返回的数据（如果为 json 格式则为解析后的 json 对象，否则为响应的纯文本信息）</li>
 *   </ul>
 * </pre>
 */
define([
	'jquery', 'vue', 'bc/vue/cors', 'text!bc/vue/page-bar-importer.html', 'css!bc/vue/page-bar-importer', 
	'bc/vue/box-pointer', 'bc/vue/loading'
], function ($, Vue, CORS, template) {
	'use strict';

	// common mapping for ext to accept
	// see https://stackoverflow.com/questions/11832930/html-input-file-accept-attribute-file-type-csv#answer-11834872
	// see https://www.iana.org/assignments/media-types/media-types.xhtml
	const ext2accept = {
		'.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // 'Microsoft Excel 工作表'
		'.xls': 'application/vnd.ms-excel',                                           // 'Microsoft Excel 97-2003 工作表'
		'.docx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // 'Microsoft Word 文档'
		'.doc': 'application/msword',                                                 // 'Microsoft Word 97-2003 文档'
		'.pdf': 'application/pdf',  // 'PDF 文件(.pdf)'
		'.image': 'image/*',        // '图片文件'
		'.audio': 'audio/*',        // '音频文件'
		'.video': 'video/*',        // '视频文件'
	};

	return Vue.component('bc-page-bar-importer', {
		template: template,
		replace: true,
		props: {
			title: { type: String, required: false, default: "导入" },
			iconClass: { type: String, required: false, default: "ui-icon-arrowthickstop-1-n"},
			hidden: { type: Boolean, required: false, default: true },
			showResult: { type: Boolean, required: false, default: true }, // 是否显示导入结果
			width: { type: String, required: false, default: "auto" },
			accept: { type: String, required: false, default: "" },
			url: { type: String, required: false, default: null },   // 如无配置默认取 this.$parent.url + '/import'
			tplUrl: { type: String, required: false, default: null }, // 如无配置默认取 this.url
			tplFilename: { type: String, required: false, default: null } // 如无配置默认取响应头中的值
		},
		data: function () {
			return {
				fileEl: null,     // 文件控件的 dom 对象
				processing: false,// 是否处理中
				loading: false,   // 是否显示进度条
				catching: false,  // 导入的 response 状态码不是 2xx 是为 true  
				dragging: false,  // 是否拖拽中
				result: {}        // 导入后的结果
			}
		},
		ready: function(){
			this.fileEl = this.$el.querySelector("input[name=upload]");
		},
		computed: {
			resultSubject: function () {
				if (this.catching) return "服务器异常！";
				let r = this.result;
				let msg;
				if (!r.errorCount) { // 成功
					msg = `成功导入 ${r.successCount} 条数据`;
					if (r.ignoreCount) msg += `，有 ${r.ignoreCount} 条数据因重复被忽略。`;
					else msg += "。";
				} else {            // 失败
					msg = `总共 ${r.totalCount} 条数据，有 ${r.errorCount} 条数据因存在异常导致导入失败`;
					if (r.ignoreCount) msg += `，有 ${r.ignoreCount} 条数据因重复而被忽略。`;
					else msg += "。";
				}
				return msg;
			}
		},
		methods: {
			// 重置
			reset: function(){
				this.fileEl.value = ''; // reset input[name=file]. will fire change event on IE11
				this.hidden = true;
				this.processing = false;
				this.loading = false;
				this.catching = false;
				this.dragging = false;
				this.result = {};
			},
			// 用户拖放上传文件
			drop: function(e){
				this.dragging = false;
				this.upload(e.dataTransfer.files[0]);
			},
			// 上传文件
			upload: function(file){
				if(!file) return;
				//console.log("name=" + file.name + ", type=" + file.type + ", size=" + file.size);

				this.processing = this.loading = true;

				// ajax 上传
				let url = this.url || this.$parent.url + "/import";
				fetch(url, CORS.autoCorsSettings(url, {
					method: 'POST',
					headers: { 
						'Content-Type': 'application/octet-stream',
						'Content-Disposition': 'attachment; filename="' + encodeURIComponent(file.name) + '"'
					},
					body: file
				})).then((res) => {
					return res.ok ? res.json() : res.text().then(function (msg) { throw new Error(msg) });
				}).then((result) => {
					this.loading = false;
					this.result = result;
					// 触发事件
					this.$dispatch("imported", true, result);
				}).catch((error) => {
					this.loading = false;

					// 触发事件
					this.$dispatch("imported", false, error.message, error);

					// 显示结果
					if (this.showResult) {
						var msg = error.message || "导入失败！";
						if (window['bc'] && bc.msg) bc.msg.alert(msg, "导入异常");
						else alert(msg);
					}

					// 出现服务器异常就重置
					this.reset();
				});
			},
			// 下载模板
			download: function(){
				// window.open(this.tplUrl || this.url || this.$parent.url + "/import", "blank");
				let url = this.tplUrl || this.url || this.$parent.url + "/import";
				CORS.download(url, this.tplFilename);
			},
			// 显示导入结果
			showResultDetail: function(){
				let result = this.result;
				//打开查看详情的窗口
				let errorWin = window.open('', 'showImportedResult');
				let errorDoc = errorWin.document;
				errorDoc.open();
				let html = [];
				let title = '数据导入异常列表';
				html.push('<!DOCTYPE html>');
				html.push('<html>');
				html.push('<head>');
				html.push('<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>');
				// 获取视图的标题
				html.push('<title>' + title + '</title>');
				html.push('<style type="text/css">');
				html.push('body>h2{margin:0.25em 0}');
				html.push('div{color:red;font-weight:bold;font-size:100%}');
				html.push('table{border:none;border-collapse:collapse}');
				html.push('thead{font-weight:bold;}');
				html.push('td{border:1px solid gray;padding:2px;}');
				html.push('td:nth-child(1),td:nth-child(2){color:red;font-weight:bold;}');
				html.push('td:nth-child(2){max-width:600px;}');
				html.push('</style>');
				html.push('</head>');
				html.push('<body>');

				html.push('<h2>' + title + '</h2>');
				html.push('<div>' + this.resultSubject + '</div>');
				html.push('<table>');

				// 构建列头行
				let columnNames = result.columnNames;
				html.push('<thead><tr>');
				html.push('<td>行号</td><td>异常信息</td>');
				for (let i = 0; i < columnNames.length; i++) {
					html.push('<td>' + columnNames[i] + '</td>');
				}
				html.push('</tr></thead>');

				// 构建数据行
				html.push('<tbody>');
				let errors = result.errors;
				let error, source, value;
				for (let i = 0; i < errors.length; i++) {
					error = errors[i];
					html.push('<tr>');
					html.push('<td>' + (error.index + 1) + '</td>');
					html.push('<td>' + error.msg + '</td>');
					source = error.source;
					for (let j = 0; j < source.length; j++) {
						value = source[j];
						html.push('<td>' + (value == 0 || value ? value : "") + '</td>');
					}
					html.push('</tr>');
				}
				html.push('</tbody></table>');

				html.push('</body>');
				html.push('</html>');
				errorDoc.write(html.join(""));
				errorDoc.close();
				errorWin.focus();
				return false;
			}
		}
	});
});