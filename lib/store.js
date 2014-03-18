
var knox = require('knox');
var parse = require('co-body').json;

var client = exports.client = knox.createClient({
  key: process.env.S3_KEY,
  secret: process.env.S3_SECRET,
  bucket: process.env.S3_BUCKET,
});

// the actual object
exports.json = {
  users: [],
  components: [],
};

exports.get = function* () {
  var res = client.getFile.bind(client, '/db.json');
  if (res.statusCode !== 200) return;
  return exports.json = yield parse(res);
};

exports.put = function* () {
  var json = JSON.stringify(exports.json);
  var res = client.put('/db.json', {
    'Content-Length': Buffer.byteLength(json),
    'Content-Type': 'application/json',
  });

  res.end(json);

  yield function (done) {
    res.on('finish', done);
    res.on('error', done);
  };
};