var serve = require('koa-static');
var koa = require('koa');
var app = koa();
const hostname = '127.0.0.1';
const port = 3000;

app.use(serve(__dirname));

app.listen(port, hostname, () => {
  console.log(`view demo at http://${hostname}:${port}/examples/index.html`);
});

app.on('error', function(err){
  log.error('server error', err);
});