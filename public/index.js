
var form = document.querySelector('#patch');
form.addEventListener('submit', function (e) {
  e.preventDefault();

  var name = this.name.value.toLowerCase().trim();
  if (!name) return;
  superagent.patch('/' + name).end();
  this.name.value = '';
})

var logs = document.querySelector('#logs');
new EventSource('/log').addEventListener('message', function (e) {
  var data = JSON.parse(e.data);
  if (data.type === 'ignore') return;
  var div = document.createElement('div');
  div.textContent = data.message;
  div.className = 'log';
  if (data.type === 'error') div.className += ' error';
  logs.appendChild(div);
  div.scrollIntoView();
})