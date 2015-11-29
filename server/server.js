// set up ========================
var express = require('express');
var app = express();                                            // create our app w/ express
var morgan = require('morgan');                                 // log requests to the console (express4)
var bodyParser = require('body-parser');                        // pull information from HTML POST (express4)
var methodOverride = require('method-override');                // simulate DELETE and PUT (express4)

// configuration =================
//app.use(express.static(__dirname + '/public'));                 // set the static files location /public/img will be /img for users
app.use(express.static(process.cwd() + '/client'));             // set the static files location /public/img will be /img for users
app.use(morgan('dev'));                                         // log every request to the console
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());

//app.get('/', function(req, res){
//  console.log('process.cwd()', process.cwd()); // /home/romelgomez/workspace/projects/berlin
//  res.send('Hello Romel Javier');
//});
//

app.get('/', function(req, res) {
  res.sendfile('./client/index.html'); // load the single view file (angular will handle the page changes on the front-end)
});

app.get('/me', function(req, res){
  res.send('Hello Romel Javier Gomez Herrera');
});

app.get('/hi/:name', function(req, res){
  var name = req.params.name;
  res.send('Hi ' + name);
});

app.get('/html-2', function(req, res){
   res.send(__dirname); // /home/romelgomez/workspace/projects/berlin/server
});

app.get('*', function(req, res){
  res.send('404');
});

var server = app.listen(3000, function(){
  console.log('The server is running in port localhost:3000');
});