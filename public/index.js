
var form = document.querySelector('#patch');
form.addEventListener('submit', function (e) {
  e.preventDefault();

  var name = this.name.value.toLowerCase();
  superagent.patch('/' + name).end();
  this.name.value = '';
})

var logs = document.querySelector('#logs');

listen();

function listen() {
  var source = new EventSource('/log');
  source.addEventListener('message', onMessage);
  // reconnect on disconnects
  source.addEventListener('error', listen);
}

function onMessage(e) {
  var data = JSON.parse(e.data);
  if (data.type === 'ignore') return;
  var div = document.createElement('div');
  div.textContent = data.message;
  div.className = 'log';
  if (data.type === 'error') div.className += ' error';
  logs.appendChild(div);
  div.scrollIntoView();
}