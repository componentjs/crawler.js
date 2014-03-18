
var PassThrough = require('stream').PassThrough;

module.exports = new PassThrough({
  objectMode: true
});