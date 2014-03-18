
var Transform = require('stream').Transform;

var transform = module.exports = new Transform({
  maxListeners: Infinity
});
transform._writableState.objectMode = true;
require('../lib').log.pipe(transform);

transform._transform = function (obj, NULL, cb) {
  this.push('data: ' + JSON.stringify(obj) + '\n\n');
  setImmediate(cb);
}

transform.on('error', function (err) {
  console.error(err.stack);
})