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
	this.set('Content-disposition', 'attachment; filename=' + encodeURIComponent('abc123中文.md'));
	this.set('Content-type', 'application/octet-stream');
});

app.use(dataRouter.routes()).use(dataRouter.allowedMethods());

// start http server
app.listen(port, hostname, () => {
	console.log(`view demo at http://${hostname}:${port}/examples/index.html`);
});

app.on('error', function (err) {
	log.error('server error', err);
});