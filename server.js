// https://github.com/koajs/static
var serve = require('koa-static');
// https://github.com/alexmingoia/koa-router
var Router = require('koa-router');
var koa = require('koa');
var app = koa();
var sleep = require('thread-sleep');
var fs = require('fs');
const hostname = '127.0.0.1';
const port = 3000;

// static files
app.use(serve(__dirname));

// dynamic data router
var dataRouter = new Router({
	prefix: '/data'
});
dataRouter.get('/grid.json', function* (next) {
	// load data
	var dataService = require("./examples/grid-data");
	var date = dataService.page(this.request.path,
		this.query.pageNo ? parseInt(this.query.pageNo) : undefined,
		this.query.pageSize ? parseInt(this.query.pageSize) : undefined);

	// respone
	this.type = "json";
	this.body = JSON.stringify(date);
});

// upload file to import
dataRouter.post('/grid.json/import', function* (next) {
	// load importedResult
	var importedResult = require("./examples/imported-result.json");

	// Sleep for microseconds
	sleep(2000);

	// respone
	this.type = "json";
	this.body = JSON.stringify(importedResult);
});

// download import-template file
dataRouter.get('/grid.json/import', function* (next) {
	this.body = fs.createReadStream(__dirname + '/README.md');
	this.set('Content-Disposition', 'attachment; filename="' + encodeURIComponent('abc123中文.md') + '"');
	this.set('Content-Type', 'application/octet-stream');
});

// export
dataRouter.get('/grid.json/export', function* (next) {
	this.body = fs.createReadStream(__dirname + '/README.md');
	this.set('Content-Disposition', 'attachment; filename="' + encodeURIComponent('test 测试.md') + '"');
	this.set('Content-Type', 'application/octet-stream');

	// Sleep for microseconds
	sleep(2000);
});

// export with error
dataRouter.get('/grid.json/export-error', function* (next) {
	console.log("export-error");
	this.type = "text";
	this.status = 400;
	this.body = "出错了，出错了，出错了，出错了，出错了，出错了，出错了，出错了，出错了！";
});

// tree
dataRouter.get('/tree.json', function* (next) {
	// load data
	var result = require("./examples/tree.json");

	// respone
	this.type = "json";
	this.body = JSON.stringify(result);
});
dataRouter.get('/tree-sub.json', function* (next) {
	// load data
	var result = require("./examples/tree-sub.json");

	// Sleep for microseconds
	sleep(2000);

	// respone
	this.type = "json";
	this.body = JSON.stringify(result);
});

// tree with error
dataRouter.get('/tree.json/error', function* (next) {
	console.log("tree-error");
	this.type = "text";
	this.status = 400;
	this.body = "出错了，出错了，出错了，出错了，出错了，出错了，出错了，出错了，出错了！";
});

app.use(dataRouter.routes()).use(dataRouter.allowedMethods());

// start http server
app.listen(port, hostname, () => {
	console.log(`view demo at http://${hostname}:${port}/examples/index.html`);
});

app.on('error', function (err) {
	log.error('server error', err);
});