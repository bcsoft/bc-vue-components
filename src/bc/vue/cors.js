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
	function appendUrlParams(url, params) {
		if (!params) return url;

		let kv = [];
		for (let key in params) kv.push(key + '=' + encodeURIComponent(params[key]));
		if (kv.length) url += (url.indexOf('?') !== -1 ? '&' : '?') + kv.join('&');
		return url;
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
		autoCorsSettings: autoCorsSettings
	};
});