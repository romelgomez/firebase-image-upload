var path = require('path');
var fs = require('fs');
var Q = require('q');
var handlebars = require('handlebars');
var Firebase = require("firebase");
var FireRef = new Firebase('berlin.firebaseio.com/');
var _ = require('lodash');


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

  FireRef.child('publications/'+uuid).once('value')
    .then(function(snapshot){

      var publication = snapshot.val();
      publication.$id = snapshot.key();

      if(snapshot.exists()){
        deferred.resolve({publication: publication});
      }else{
        deferred.reject('Error in getPublication function');
      }

    }, function (error) {
      deferred.reject(error);
    });

  return deferred.promise;
}


function getUser (uuid){
  var deferred = Q.defer();

  FireRef.child('users/'+uuid).once('value')
    .then(function(snapshot){
      var user = snapshot.val();
      user.$id = snapshot.key();

      if(snapshot.exists()){
        deferred.resolve({user: user});
      }else{
        deferred.reject('User does not exist');
      }

    }, function (error) {
      deferred.reject(error);
    });

  return deferred.promise;
}

function getProfile(accountName){
  var deferred = $q.defer();

  FireRef.child('accountNames').child(accountName).once('value')
    .then(function(snapshot){
      if(snapshot.exists()){
        // get profile data by the id (snapshot.val() - facebook:10204911533563856)
        return  getUser(snapshot.val());
      }else{
        // maybe is a userID
        return  getUser(accountName);
      }
    })
    .then(function(the){
      if(typeof the.user.startedAt !== 'undefined'){
        deferred.resolve({profile : the.user});
      }else {
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

function setMetaURL2 (publicationID, publication, user){
  metaTags.url = 'https://londres.herokuapp.com/';

  /*
   http://localhost:8080/walesServicesLTD/transport-specialized-other-brands-in-scotland-central-scotland/-KIz5P7HuvRD7k6D8rPB/wethepeople-envy-35.html
   locations: [ 'Scotland', 'North East Scotland', 'Dundee East' ],
   categories: [ 'Transport', 'Specialized', 'Others' ],
  */

  var categoriesAndLocations = '';
  var categories = _.join(publication.categories, ' ');
  var locations  = _.join(publication.locations, ' ');
  categoriesAndLocations += categories;
  categoriesAndLocations += ' in ';
  categoriesAndLocations += locations;

  metaTags.url += typeof user.accountName !== 'undefined' && user.accountName !== '' ? user.accountName + '/': user.$id + '/';
  metaTags.url += slug(categoriesAndLocations) + '/';
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
    //console.log('req.params.id',req.params.id);

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

  // http://localhost:8080/walesServicesLTD

  app.get('/:accountName', function(req, res){
    //console.log(' all requests');
    //res.send('#### 404 ####');

    var user = {};


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

  //http://localhost:8080/walesServicesLTD/transport-specialized-in-scotland-central-scotland/-KIz5P7HuvRD7k6D8rPB/wethepeople-envy-35.html


  app.get('/:accountName/:categoriesAndLocations/:publicationID/:title', function(req, res){
    //console.log('***** /:accountName/:categoriesAndLocations/:publicationID/:title *****');

    var publication = {};
    var user = {};

    getPublication(req.params.publicationID)
      .then(function(the){
        publication = the.publication;
        //console.log('publication', publication);
        return getUser(publication.userID)
      })
      .then(function(the){
        user = the.user;

        setMetaTitle(publication);
        setMetaURL2(req.params.publicationID, publication, user);
        metaTags.description = publication.description;
        setMetaImage(publication);

        //console.log('user', user);
        //console.log('metas', metaTags);

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

    //res.sendFile('index1.html', {root: path.join(process.cwd(), basePath)});
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
