/**
 * 跨域访问方法封装。
 * 
 * cors('my-url', 'GET')
 * .then(data -> {...})  // 2xx 响应时
 * .catch(error -> {...}) // error 或非 2xx 响应
 */
define([], function () {
	"use strict";

  function getAuthorizationHeaders() {
    return {"Authorization": localStorage.authorization};
	}

  /** 跨域访问方法封装 */
  function cors(url, method, body, contentType) {
    let options = {headers: getAuthorizationHeaders()};
    if (method) options.method = method;
    if (body) options.body = body;
    if (contentType) options.headers["Content-Type"] = contentType;
    return fetch(url, options).then(function (res) {
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
		get: function(url){
			return cors(url, 'GET');
		},
		post: function(url, body, contentType){
			return cors(url, 'POST', body, contentType);
		},
		appendUrlParams: function(url, params){
			return appendUrlParams(url, params);
		}
	};
});