module.exports = function(app) {

  //app.get('/', function(req, res) {
  //  console.log('process.cwd() :',process.cwd());
  //  console.log('__dirname :',__dirname);
  //  res.send('Hello Romel Javier Gomez Herrera');
  //});

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


  // Publications

  //POST, GET, PUT, and DELETE

  // get all publications
  app.get('/api/v1/publications', function(req, res){

  });

  // create a publication
  app.post('/api/v1/publications', function(req, res){

    var mockModel = {

    };

  });

  // delete a publication
  app.delete('/api/v1/publications/:publicationId', function(req, res){

  });

};
