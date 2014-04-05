
var co = require('co');
var assert = require('assert');

var crawler = require('../lib');
var store = require('../lib/store');

describe('crawler', function () {
  it('should delete any current .json', function (done) {
    store.client.deleteFile('/db.json', done);
    store.json = {
      users: [],
      components: [],
    };
  })

  it('should crawl jonathanong', co(function* () {
    yield* crawler.patch('jonathanong');
    var json = store.json;
    json.users.should.include('jonathanong');
    assert(json.components.some(function (component) {
      return component.name === 'horizontal-grid-packing';
    }))
  }))
})