/**
 * 分页条的导入组件
 * <pre>
 *   UI 使用：
 *   <bc-page-bar-importer [title="导入"] [url="..."] [template-url="..."] [@callback="..."]/>
 * 
 *   参数说明：
 *   <ul>
 *     <li>title {String} [可选] 按钮的鼠标提示文字，默认为 “导入”</li>
 *     <li>iconClass {String} [可选] 按钮的图标样式，默认为 “ui-icon-arrowthickstop-1-n”</li>
 *     <li>width {String} [可选] box-pointer 的宽度，默认为 'auto'</li>
 *     <li>hidden {Boolean} [可选] 是否隐藏不显示 box-pointer，默认为 true</li>
 *     <li>tplUrl {String} [必须] 下载模板的 URL</li>
 *     <li>accept {String} [可选] 上传数据时可选择的文件类型，默认为 ".xls,.xlsx"</li>
 *     <li>imported {Event} 导入完毕后的事件，
 *           第 1 个参数为代表导入是否全部成功的标记（(status=2xx && errorCount=0) or status!=2xx），
 *           第 2 个参数为服务器返回的数据（如果为 json 格式则为解析后的 json 对象，否则为响应的纯文本信息）</li>
 *   </ul>
 * </pre>
 */
define([
	'jquery', 'vue', 'text!bc/vue/page-bar-importer.html', 'css!bc/vue/page-bar-importer', 
	'bc/vue/box-pointer', 'bc/vue/loading'
], function ($, Vue, template) {
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
			width: { type: String, required: false, default: "auto" },
			accept: { type: String, required: false, default: "" },
			url: { type: String, required: false, default: null },   // 如无配置默认取 $parent.url + '/import'
			tplUrl: { type: String, required: false, default: null } // 如无配置默认取 $parent.url + '/import-template'
		},
		data: function () {
			return {
				uploading: false, // 控制显示上传进度
				dragging: false
			}
		},
		methods: {
			// 用户选择文件后上传文件
			fileChanged: function(e){
				this.upload(e.target.files[0], () => {
					e.target.value = ''; // reset input[name=file]. will fire change event on IE11
				});
			},
			// 用户拖放上传文件
			drop: function(e){
				e.stopPropagation();
				e.preventDefault();
				console.log("drop");
				this.dragging = false;
				this.upload(e.dataTransfer.files[0]);
			},
			// 上传数据
			upload: function(file, callback){
				if(!file) return;
				console.log("name=" + file.name + ", type=" + file.type + ", size=" + file.size);

				this.uploading = true;

				// ajax 上传
				var xhr = new XMLHttpRequest();
				xhr.upload.onprogress = function (e) { // 上传进度
					let percent = Math.round((e.loaded / e.total) * 100) + "%";
					console.log(percent);
				};

				xhr.onreadystatechange = function () {
					console.log("readyState=" + xhr.readyState + ", status=" + xhr.status);
					if (xhr.readyState === 4) { // 上传完毕
						vm.uploading = false;
						callback && callback();

						if (xhr.status === 200) {
							console.log("upload success");
						} else {
							console.log("upload failed");
						}

						// 触发事件
						vm.$dispatch("imported", xhr.status >= 200 && xhr.status < 400, xhr.responseText, xhr.status, xhr);
					}
				};

				xhr.open("POST", this.url ? this.url : this.$parent.url + "/import");
				//xhr.overrideMimeType('application/octet-stream');
				xhr.setRequestHeader('Content-Type', 'application/octet-stream');
				xhr.setRequestHeader('Authorization', window.localStorage.authorization);
				// 对文件名进行 URI 编码避免后台中文乱码（后台需URI解码）
				xhr.setRequestHeader('Content-Disposition', 'attachment; name="' + encodeURIComponent(file.name) + '"');
				xhr.send(file);
			},
			// 下载模板
			download: function(){
				window.open(this.tplUrl ? this.tplUrl : this.$parent.url + "/import-template", "blank");
			}
		}
	});
});