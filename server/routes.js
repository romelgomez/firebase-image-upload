var path = require('path');

//process.cwd() : /home/romelgomez/workspace/projects/berlin
//__dirname : /home/romelgomez/workspace/projects/berlin/server

module.exports = function(app) {

  var basePath = '';

  switch(process.env.NODE_ENV) {
    case 'production':
      basePath = '/dist';
      break;
    case 'development':
      basePath = '/public';
      break;
  }

  app.get('/', function(req, res) {
    res.sendFile('index1.html', {root: path.join(process.cwd(), basePath)});
  });

  //app.get('/me', function(req, res){
  //  res.send('Hello Romel Javier Gomez Herrera');
  //});

  //
  //app.get('/hi/:name', function(req, res){
  //  var name = req.params.name;
  //  res.send('Hi ' + name);
  //});
  //
  //app.get('/html-2', function(req, res){
  //  res.send(__dirname); // /home/romelgomez/workspace/projects/berlin/server
  //});

  app.get('*', function(req, res){
    //console.log(' all requests');
    res.send('#### 404 ####');
  });

  // Publications
  //POST, GET, PUT, and DELETE

  //var Firebase = require("firebase");
  //
  //// get all publications
  //app.get('/v1/publications', function(req, res){
  //
  //});
  //
  //// create a publication
  //app.post('/v1/publications', function(req, res){
  //  var mockModel = {
  //
  //  };
  //});
  //
  //// delete a publication
  //app.delete('/v1/publications/:publicationId', function(req, res){
  //
  //});

};
