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

  app.get('*', function(req, res){
    //console.log(' all requests');
    //res.send('#### 404 ####');
    res.sendFile('index1.html', {root: path.join(process.cwd(), basePath)});
  });


  //app.get('/view-publication/:id/:title', function(req, res){
  //  console.log('req.params.id',req.params.id);
  //
  //  //var publicationRef = new Firebase('berlin.firebaseio.com/publications/'+req.params.id);
  //
  //  //var source = "<p>Hello, my name is {{name}}. I am from {{hometown}}. I have " +
  //  //  "{{kids.length}} kids:</p>" +
  //  //  "<ul>{{#kids}}<li>{{name}} is {{age}}</li>{{/kids}}</ul>";
  //
  //  fs.readFile( path.join(process.cwd(), basePath, '/view.html'), function (err, source) {
  //    if (err) {
  //      throw err;
  //    }
  //
  //    var template = handlebars.compile(source.toString());
  //
  //    var data = { "name": "Alan", "hometown": "Somewhere, TX",
  //      "kids": [{"name": "Jimmy", "age": "12"}, {"name": "Sally", "age": "4"}]};
  //
  //    var result = template(data);
  //
  //    res.send(result);
  //  })
  //
  //});

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
