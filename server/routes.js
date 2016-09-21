var path = require('path');

var basePath = '';

switch(process.env.NODE_ENV) {
  case 'production':
    basePath = '/dist';
    break;
  case 'development':
    basePath = '/public';
    break;
}

function defaultRoute(req, res){
  res.sendFile('index1.html', {root: path.join(process.cwd(), basePath)});
}

module.exports = function(app) {

  app.get('/', function(req, res) {
    defaultRoute(req, res);
  });

  app.get('*', function(req, res){
    defaultRoute(req, res);
  });

};