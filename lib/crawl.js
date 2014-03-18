
var CONCURRENCY = parseInt(process.env.CONCURRENCY, 10) || 5;
var GITHUB_USERNAME = process.env.GITHUB_USERNAME;
var GITHUB_PASSWORD = process.env.GITHUB_PASSWORD;
if (!GITHUB_USERNAME && !GITHUB_PASSWORD) throw new Error('github username and password is required.');

var co = require('co');
var channel = require('chanel');
var request = require('cogent').extend({
  auth: GITHUB_USERNAME + ':' + GITHUB_PASSWORD,
});

var store = require('./store');
var log = require('./log');

module.exports = function* (user) {
  var start = Date.now();
  log.write({
    context: 'user',
    user: user,
    type: 'info',
    message: 'Updating "' + user + '".',
  })

  // remove all components under this user
  var components = store.json.components;
  for (var i = 0; i < components.length; i++) {
    var component = components[i];
    if (component.repo.split('/')[0] === user) {
      components.splice(i, 1);
    }
  }

  // get all the user's repos
  var res = yield* request('https://api.github.com/search/repositories?q=user:' + user, true);
  if (res.statusCode === 404) {
    res.resume();
    log.write({
      context: 'user',
      user: user,
      type: 'error',
      message: 'User "' + user + '" not found.',
    })
    return;
  }
  if (res.statusCode !== 200) {
    res.resume();
    log.write({
      context: 'user',
      user: user,
      type: 'error',
      message: 'Error searching "' + user + '"\'s repositories.',
    })
    return;
  }

  // store the user info
  var json = store.json.users[user] = res.body;

  // iterate through each repo with concurrency
  var ch = channel({
    concurrency: CONCURRENCY,
    discard: true,
  });
  var items = json.items;
  for (var i = 0; i < items.length; i++) {
    ch.push(co(crawlRepository(user, items[i])));
  }
  yield ch(true);
  yield* store.put();

  log.write({
    context: 'user',
    user: user,
    type: 'info',
    message: 'Updated "' + user + '" in ' + Math.round((Date.now() - start) / 1000) + ' seconds.',
  })
}

function* crawlRepository(user, data) {
  var repo = data.name.toLowerCase();
  var master = data.default_branch;
  var res = yield* request('https://raw.github.com/' + user + '/' + repo + '/' + master + '/component.json', true);
  if (res.statusCode === 404) {
    res.resume();
    log.write({
      context: 'repo',
      user: user,
      repo: repo,
      type: 'ignore',
      message: 'Repository "' + user + '/' + repo + '" does not have a component.json.',
    });
    return;
  }
  if (res.statusCode !== 200) {
    res.resume();
    log.write({
      context: 'repo',
      user: user,
      repo: repo,
      type: 'error',
      message: 'Error GETing "' + user + '/' + repo + '"\'s component.json.',
    });
    return;
  }
  var json = res.body;
  if (json.private) return;
  json.repo = user + '/' + repo;
  json.github = data;
  store.json.components.push(json);
  log.write({
    content: 'repo',
    user: user,
    repo: repo,
    type: 'info',
    message: 'Repository "' + user + '/' + repo + '" has been updated.',
  });
}
