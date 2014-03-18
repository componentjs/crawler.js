
var co = require('co');
var EventEmitter = require('events').EventEmitter;

var crawl = require('./crawl');
var log = require('./log');
var store = require('./store');

var state = module.exports = new EventEmitter();
state.await = function (event) {
  return function (done) {
    state.once(event, done);
  }
};

state.queue = [];
state.initialized = false;

state.log = log;
Object.defineProperty(state, 'json', {
  get: function () {
    return store.json;
  }
});

state.patch = function* (user) {
  user = user.toLowerCase();
  if (state.progress === user || ~state.queue.indexOf(user)) {
    return log.write({
      context: 'update',
      user: user,
      type: 'info',
      message: 'Updating "' + user + '" already in progress.',
    })
  }
  var queue = state.queue;
  queue.push(user);
  if (state.progress) {
    return log.write({
      context: 'update',
      user: user,
      type: 'info',
      message: 'Queueing "' + user + '" for updating.',
    })
  }
  while (queue.length) {
    user = state.progress = queue.shift();
    yield* crawl(user);
  }
  state.progress = null;
}

if (process.env.NODE_ENV !== 'test') {
  co(store.get)(function (err) {
    if (err) throw err;
    state.initialized = true;
    state.emit('initialized');
  })
}
