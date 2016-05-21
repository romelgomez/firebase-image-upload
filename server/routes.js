var path = require('path');
var fs = require('fs');
var Q = require('q');
var handlebars = require('handlebars');
var Firebase = require("firebase");

var basePath = '';

switch(process.env.NODE_ENV) {
  case 'production':
    basePath = '/dist';
    break;
  case 'development':
    basePath = '/public';
    break;
}

//process.cwd() : /home/romelgomez/workspace/projects/berlin
//__dirname : /home/romelgomez/workspace/projects/berlin/server

var metaTags = {
  title:        'MarketOfLondon.UK - Jobs, Real Estate, Transport, Services, Marketplace related Publications',
  url:          'https://londres.herokuapp.com',
  description:  'Jobs, Real Estate, Transport, Services, Marketplace related Publications',
  image:        'https://londres.herokuapp.com/static/assets/images/uk.jpg'
};

function readFile(fileName){
  var deferred = Q.defer();

  fs.readFile( path.join(process.cwd(), basePath, fileName), function (error, source) {
    if (error) {
      deferred.reject(error);
    }else{
      deferred.resolve({source: source});
    }
  });

  return deferred.promise;
}

function getPublication (uuid){
  var deferred = Q.defer();

  var publicationRef = new Firebase('berlin.firebaseio.com/publications/'+uuid);
  publicationRef.once('value', function (dataSnapshot) {
    //console.log('dataSnapshot.val()',dataSnapshot.val());

    if(dataSnapshot.exists()){
      deferred.resolve({publication: dataSnapshot.val()});
    }else{
      deferred.reject();
    }

  }, function (error) {
    deferred.reject(error);
  });

  return deferred.promise;
}

function slug(input) {
  return (!!input) ? String(input).toLowerCase().replace(/[^a-zá-źA-ZÁ-Ź0-9]/g, ' ').trim().replace(/\s{2,}/g, ' ').replace(/\s+/g, '-') : '';
}

function capitalize(input) {
  return (!!input) ? input.replace(/([^\W_]+[^\s-]*) */g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}) : '';
}

function setMetaTitle (publication){
  metaTags.title = capitalize(publication.title).trim();
  metaTags.title += publication.department === 'Real Estate'? ' for ' + (publication.res.reHomeFor | uppercase) : '';
  metaTags.title += ' - MarketOfLondon.UK';
}

function setMetaURL (publicationID, publication){
  metaTags.url = 'https://londres.herokuapp.com/view-publication/';
  metaTags.url += publicationID + '/';
  metaTags.url += slug(publication.title) + '.html';
}

function setMetaImage (publication){
  var images = [];

  for (var imageID in publication.images) {
    if( publication.images.hasOwnProperty( imageID ) ) {
      publication.images[imageID].$id = imageID;
      if(imageID !== publication.featuredImageId){
        images.push(publication.images[imageID]);
      }else{
        images.unshift(publication.images[imageID])
      }
    }
  }

  metaTags.image = images.length > 0? ('http://res.cloudinary.com/berlin/image/upload/c_fill,h_630,w_1200/'+ images[0].$id +'.jpg') : 'https://londres.herokuapp.com/static/assets/images/uk.svg';
}
module.exports = function(app) {

  app.get('/', function(req, res) {

    readFile('index1.html')
      .then(function(the){
        var template = handlebars.compile(the.source.toString());
        return Q.when({result: template(metaTags)})
      })
      .then(function(the){
        res.send(the.result);
      },function(error){
        throw error;
      });

    //res.sendFile('index1.html', {root: path.join(process.cwd(), basePath)});
  });

  app.get('/view-publication/:id/:title', function(req, res){
    console.log('req.params.id',req.params.id);

    getPublication(req.params.id)
      .then(function(the){

        setMetaTitle(the.publication);
        setMetaURL(req.params.id, the.publication);
        metaTags.description = the.publication.description;
        setMetaImage(the.publication);

        return readFile('index1.html');
      })
      .then(function(the){
        var template = handlebars.compile(the.source.toString());
        return Q.when({result: template(metaTags)})
      })
      .then(function(the){
        res.send(the.result);
      },function(error){
        //throw error;
        res.redirect('/');
      });

  });


  app.get('*', function(req, res){
    //console.log(' all requests');
    //res.send('#### 404 ####');

    readFile('index1.html')
      .then(function(the){
        var template = handlebars.compile(the.source.toString());
        return Q.when({result: template(metaTags)})
      })
      .then(function(the){
        res.send(the.result);
      },function(error){
        throw error;
      });


    //res.sendFile('index1.html', {root: path.join(process.cwd(), basePath)});
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
