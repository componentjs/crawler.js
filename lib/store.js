
var knox = require('knox');
var get = require('raw-body');

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
  var res = yield client.getFile.bind(client, '/db.json');
  if (res.statusCode !== 200) return;
  return exports.json = JSON.parse(yield get(res, {
    encoding: true
  }));
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