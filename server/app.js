// set up ========================
var compression = require('compression');
var express = require('express');
var app = express();  // create our app w/ express
var morgan = require('morgan'); // log requests to the console (express4)
var path = require('path'); // normalize the paths : http://stackoverflow.com/questions/9756567/do-you-need-to-use-path-join-in-node-js
var bodyParser = require('body-parser'); // pull information from HTML POST (express4)
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
var port = process.env.PORT || 9090;
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// configuration =================
app.use(compression());
app.use(express.static(path.join(process.cwd(), 'dist'), { 'Cache-Control': 'public', maxAge: '7d' })); // set the static files location /public/img will be /img for users
//app.use('/bower_components',  express.static(path.join(process.cwd(), 'bower_components'))); // set the static files location of bower_components
//app.use(express.static(path.join(process.cwd(), 'dist'))); // set the static files location /public/img will be /img for users
app.use(morgan('dev'));  // log every request to the console
app.use(bodyParser.urlencoded({'extended':'true'})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());

require('./routes')(app);
require('./cloudinary/cloudinary')(app);

var server = app.listen(port, function(){
  console.log('The server is running in port localhost: ',port);
});

//console.log('__dirname',__dirname);
//console.log('process.cwd()',process.cwd());
//console.log('__filename',__filename);