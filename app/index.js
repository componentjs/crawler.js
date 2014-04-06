
var co = require('co');
var koa = require('koa');
var join = require('path').join;
var finished = require('finished');
var Through = require('stream').PassThrough;

var crawler = require('../');
var sse = require('./sse');

var app = module.exports = koa();
app.use(require('koa-logger')());
app.use(require('koa-compress')({
  flush: require('zlib').Z_SYNC_FLUSH,
}));
app.use(require('koa-conditional-get')());
app.use(require('koa-etag')());
app.use(require('koa-json')({
  pretty: false,
  param: 'pretty',
}));
app.use(require('koa-static')(join(__dirname, '..', 'public'), {
  defer: true,
}));

// GET the entire .json file
app.use(function* (next) {
  if (this.request.path !== '/.json') return yield* next;

  var METHODS = 'OPTIONS,HEAD,GET';
  cors.call(this, METHODS);
  this.response.set('Cache-Control', 'public, max-age=3600');

  switch (this.request.method) {
    case 'HEAD':
    case 'GET':
      this.response.body = crawler.json;
      return;
    case 'OPTIONS':
      this.response.set('Allow', METHODS);
      this.response.status = 204;
      return;
    default:
      this.response.set('Allow', METHODS);
      this.response.status = 405;
      return;
  }
})

// SSE stream of logs
app.use(function* (next) {
  if (this.request.path !== '/log') return yield* next;

  this.req.setTimeout(Infinity);
  this.response.type = 'text/event-stream';
  this.response.set('Access-Control-Allow-Origin', '*');
  this.response.set('Cache-Control', 'private');
  var through =
  this.response.body = sse.pipe(new Through()).on('error', this.onerror);
  finished(this, function () {
    sse.unpipe(through);
  });
})

// GET and PATCH a user
app.use(function* (next) {
  var match = /^\/([\w-]+)$/.exec(this.request.path);
  if (!match) return yield* next;

  var user = match[1].toLowerCase();
  var METHODS = 'OPTIONS,HEAD,GET,PATCH';
  cors.call(this, METHODS);
  this.response.set('Cache-Control', 'public, max-age=3600');

  switch (this.request.method) {
    case 'HEAD':
    case 'GET':
      this.response.body = crawler.json.components.filter(function (component) {
        return component.repo.split('/')[0] === user;
      })
      return;
    case 'PATCH':
      co(crawler.patch(user))(this.onerror);
      this.response.status = 202;
      return;
    case 'OPTIONS':
      this.response.set('Allow', METHODS);
      this.response.status = 204;
      return;
    default:
      this.response.set('Allow', METHODS);
      this.response.status = 405;
      return;
  }
})

// GET a repo
app.use(function* (next) {
  var match = /^\/([\w-]+\/[\w-\.]+)$/.exec(this.request.path);
  if (!match) return yield* next;

  var repo = match[1].toLowerCase();
  var METHODS = 'OPTIONS,HEAD,GET';
  cors.call(this, METHODS);
  this.response.set('Cache-Control', 'public, max-age=3600');

  switch (this.request.method) {
    case 'HEAD':
    case 'GET':
      var components = crawler.json.components;
      for (var i = 0; i < components.length; i++) {
        if (components[i].repo === repo) {
          this.response.body = components[i];
          return;
        }
      }
      this.response.status = 404;
      return;
    case 'OPTIONS':
      this.response.set('Allow', METHODS);
      this.response.status = 204;
      return;
    default:
      this.response.set('Allow', METHODS);
      this.response.status = 405;
      return;
  }
})

function cors(METHODS) {
  this.response.set('Access-Control-Allow-Origin', '*');
  this.response.set('Access-Control-Allow-Methods', METHODS);
}

if (!module.parent) {
  var port = process.env.PORT || 3000;
  app.listen(port);
  console.log('Component Crawler listening on port ' + port + '.');
}