/**
 * 跨域访问方法封装。
 * 
 * cors('my-url', 'GET')
 * .then(data -> {...})  // 2xx 响应时
 * .catch(error -> {...}) // error 或非 2xx 响应
 */
define([], function () {
	"use strict";
	let link4CheckCors = document.createElement('a');

	// 判断 url 是否是跨域请求
	function urlIsCors(url) {
		let url_ = url.toLowerCase();
		if (url_.indexOf("http://") === 0 || url_.indexOf("https://") === 0 || url_.indexOf("//") === 0) {
			link4CheckCors.setAttribute('href', url_);
			if (link4CheckCors.host !== location.host) return true;
		}
		return false;
	}

	// 自动处理跨域请求头或非跨域 cookies
	function autoCorsSettings(url, settings, forceCors) {
		if (!settings) settings = {};
		if (forceCors || urlIsCors(url)) { 	// 跨域请求使用 Authorization 头
			if (!settings.headers) settings.headers = {};
			settings.headers["Authorization"] = window.localStorage.authorization;
		} else { 														// 非跨域请求退回使用 cookies
			settings.credentials = 'include';
		}
		return settings;
	}

	function getAuthorizationHeaders() {
		return { "Authorization": localStorage.authorization };
	}

	/** 跨域访问方法封装 */
	function cors(url, method, body, contentType, forceCors) {
		let settings = {};
		if (method) settings.method = method;
		if (body) settings.body = body;
		if (contentType) settings.headers = { "Content-Type": contentType };
		return fetch(url, autoCorsSettings(url, settings, forceCors)).then(function (res) {
			return res.ok ? (res.status === 204 ? null : res.json()) : res.text().then(function (msg) {
				throw new Error(msg)
			});
		});
	}

	// 附加 URL 参数
	function appendUrlParams(url, params, unEncode) {
		if (!params) return url;

		let kv = [];
		if (unEncode) {
			for (let key in params) kv.push(key + '=' + params[key]);
		} else {
			for (let key in params) kv.push(key + '=' + encodeURIComponent(params[key]));
		}
		if (kv.length) url += (url.indexOf('?') !== -1 ? '&' : '?') + kv.join('&');
		return url;
	}

	// Ajax 下载文件
	function download(url, filename) {
		return fetch(url, autoCorsSettings(url, {
			method: "GET"
		})).then(res => {
			if (!filename) {
				// 从响应头中获取服务端指定的文件名
				//for(let key of res.headers.keys()) console.log("key=" + key);
				let h = res.headers.get('Content-Disposition');
				if (h && h.includes('filename=')) {
					filename = h.substring(h.indexOf('filename=') + 9);
					if (filename.startsWith('"')) filename = filename.substring(1, filename.length - 1);
					filename = decodeURIComponent(filename);
				} else {
					h = res.headers.get('filename');
					filename = h ? decodeURIComponent(h) : null;
				}
			}

			return res.ok ? res.blob() : res.text().then(function (msg) { throw new Error(msg) });
		}).then(blob => {
			// 100mb is test ok
			// see https://stackoverflow.com/questions/32545632/how-can-i-download-a-file-using-window-fetch
			const data = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = data;
			a.download = filename || "NONAME"; // 浏览器保存下载的文件时使用的文件名
			a.click();
		});
	}

	return {
		get: function (url) {
			return cors(url, 'GET');
		},
		post: function (url, body, contentType) {
			return cors(url, 'POST', body, contentType);
		},
		appendUrlParams: function (url, params) {
			return appendUrlParams(url, params);
		},
		/** 判断 url 是否是跨域请求 */
		urlIsCors: urlIsCors,
		/** 自动处理跨域请求头或非跨域 cookies */
		autoCorsSettings: autoCorsSettings,
		/** Ajax 下载文件 */
		download: download
	};
});