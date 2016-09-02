var path = require('path');
var fs = require('fs');
var Q = require('q');
var handlebars = require('handlebars');
var md5 = require('js-md5');


//var Firebase = require("firebase");
//var FireRef = new Firebase('berlin.firebaseio.com/');
var firebase = require('./fire');


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
  title:          'Market of London - Jobs Classified Ads - UK',
  url:            'http://www.marketoflondon.co.uk',
  description:    'Share easily your brand and offers of jobs in social networks, also publications of services, transports, real estate, and marketplace items.',
  image:          'http://res.cloudinary.com/berlin/image/upload/c_fill,e_sepia:77,h_630,q_auto:best,w_1200/v1471288313/Market_Of_London_share_image_xan9wg.webp',
  twitterAccount: '@MarketOfLondon'
};

function capitalizeFirstChar(input) {
  return (!!input) ? input.trim().replace(/(^\w?)/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1);}) : '';
}

function lodashTruncates(text, length) {
  var _text = _.truncate(text, {
    length: length,
    separator: /,? +/
  });
  return capitalizeFirstChar(_text);
}

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

function getPublicationByUUDID (uuid){
  var deferred = Q.defer();

  firebase.FireRef.child('publications/'+uuid).once('value')
    .then(function(snapshot){

      var publication = snapshot.val();
      publication.$id = snapshot.key;

      if(snapshot.exists()){
        deferred.resolve(publication);
      }else{
        deferred.reject('Error in getPublication function');
      }

    }, function (error) {
      deferred.reject(error);
    });

  return deferred.promise;
}

function getUserByUUID (uuid){
  var deferred = Q.defer();

  firebase.FireRef.child('users/'+uuid).once('value')
    .then(function(snapshot){

      if(snapshot.exists()){
        var user = snapshot.val();
        user.$id = snapshot.key;
        deferred.resolve(user);
      }else{
        deferred.reject('User does not exist');
      }

    }, function (error) {
      deferred.reject(error);
    });

  return deferred.promise;
}

function getUserByAccountName (accountName){
  var deferred = Q.defer();

  firebase.FireRef.child('accountNames').child(accountName).once('value')
    .then(function(snapshot){
      if(snapshot.exists()){
        // get profile data by the id (snapshot.val() - facebook:10204911533563856)
        return  getUserByUUID(snapshot.val());
      }else{
        // maybe is a userID
        return  getUserByUUID(accountName);
      }
    })
    .then(function(user){
      if(typeof user.startedAt !== 'undefined'){
        deferred.resolve(user);
      }else {
        deferred.reject();
      }
    }, function (error) {
      deferred.reject(error);
    });

  return deferred.promise;
}

function gotVIP (userID, invoiceId){
  var deferred = Q.defer();

  firebase.FireRef.child('users').child(userID).update({
      vip: true,
      invoiceId: invoiceId
    })
    .then(function(user){
      deferred.resolve(user);
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

function setMetaImage (images, featuredImageId){
  var $images = [];

  for (var imageID in images) {
    if( images.hasOwnProperty( imageID ) ) {
      images[imageID].$id = imageID;
      if(imageID !== featuredImageId){
        $images.push(images[imageID]);
      }else{
        $images.unshift(images[imageID])
      }
    }
  }

  metaTags.image = $images.length > 0? ('http://res.cloudinary.com/berlin/image/upload/c_fill,h_630,q_auto:best,w_1200/'+ $images[0].$id +'.webp') : metaTags.image;
}

function defaultRoute(req, res){
  readFile('index1.html')
    .then(function(the){
      var template = handlebars.compile(the.source.toString());
      return Q.when({result: template(metaTags)})
    })
    .then(function(the){
      metaTags = {
        title:          'Market of London - Jobs Classified Ads - UK',
        url:            'http://www.marketoflondon.co.uk',
        description:    'Share easily your brand and offers of jobs in social networks, also publications of services, transports, real estate, and marketplace items.',
        image:          'http://res.cloudinary.com/berlin/image/upload/c_fill,e_sepia:77,h_630,q_auto:best,w_1200/v1471288313/Market_Of_London_share_image_xan9wg.webp',
        twitterAccount: '@MarketOfLondon'
      };
      res.send(the.result);
    },function(error){
      throw error;
    });

  //res.sendFile('index1.html', {root: path.join(process.cwd(), basePath)});
}

module.exports = function(app) {

  app.get('/', function(req, res) {
    // Rewrite Cache-Control set defined in app.js
    //res.set({
    //  'Cache-Control': 'no-cache'
    //});
    defaultRoute(req, res);
  });

  // google-site-verification for http://www.marketoflondon.co.uk/
  app.get('/googleb3b941affe88d9b8.html', function(req, res) {
    res.sendFile('googleb3b941affe88d9b8.html', {root: path.join(process.cwd(), basePath)});
  });

  app.get('/sitemap.txt', function(req, res) {
    res.sendFile('sitemap.txt', {root: path.join(process.cwd(), basePath)});
  });

  app.get('/features', function(req, res) {
    defaultRoute(req, res);
  });

  app.get('/contact-us', function(req, res) {
    defaultRoute(req, res);
  });

  // 2Checkout Error when upgrading to vip
  app.get('/error-when-upgrading-to-vip', function(req, res) {
    defaultRoute(req, res);
  });

  app.get('/thank-you', function(req, res) {
    defaultRoute(req, res);
  });

  app.get('/upgrade', function(req, res) {
    res.redirect('/error-when-upgrading-to-vip');
  });

  app.get('/upgrade-to-vip', function(req, res) {
    defaultRoute(req, res);
  });

  app.post('/upgrade', function(req, res) {

    // 2Checkout Theme Color #831eff

    //console.log('');
    //console.log('************************************ 2Checkout Approved URL *********************************************');
    //console.log('2Checkout Approved URL req.method:', req.method);
    //console.log('2Checkout Approved URL req.url:', req.url);
    //console.log('2Checkout Approved URL req.body: \n', req.body);
    //console.log('#################################### 2Checkout Approved URL ##############################################');
    //console.log('');

    if(typeof req.body.auuid !== 'undefined' && req.body.auuid !== ''){

      var hash = md5('NmJmM2E3NTAtMjM2OS00OTg3LThhNTMtNjk3ODY3NTM4MzM4' + '103002757' + req.body.order_number + req.body.total).toUpperCase();

      /* Test in Demo MODE: https://www.2checkout.com/documentation/checkout/passback/validation/
      var hash = '';
      if(req.body.demo === 'Y'){
        hash = md5('NmJmM2E3NTAtMjM2OS00OTg3LThhNTMtNjk3ODY3NTM4MzM4' + '103002757' + 1 + req.body.total).toUpperCase();
      }else{
        hash = md5('NmJmM2E3NTAtMjM2OS00OTg3LThhNTMtNjk3ODY3NTM4MzM4' + '103002757' + req.body.order_number + req.body.total).toUpperCase();
      }
      */

      //console.log('hash', hash);
      //console.log('req.body.key', req.body.key);
      if(hash === req.body.key){

        gotVIP(req.body.auuid, req.body.invoice_id)
          .then(function(){
            res.redirect('/thank-you');
          },function(){
            res.redirect('/error-when-upgrading-to-vip');
          });

      }else{
        //console.log('hash not match');
        res.redirect('/error-when-upgrading-to-vip');
      }
    }else{
      //console.log('auuid is undefined');
      res.redirect('/error-when-upgrading-to-vip');
    }

  });

  // 2Checkout Instant Notification Service
  //app.post('/2co-ins', function(req, res) {
  //
  //  console.log('');
  //  console.log('************************************ 2Checkout Instant Notification Service *********************************************');
  //  console.log('2Checkout Instant Notification Service req:', req.method);
  //  console.log('2Checkout Instant Notification Service req:', req.url);
  //  console.log('2Checkout Instant Notification Service req: \n', req.body);
  //  console.log('#################################### 2Checkout Instant Notification Service ##############################################');
  //  console.log('');
  //
  //  defaultRoute(req, res);
  //});


  app.get('/robots.txt', function(req, res) {
    res.sendFile('robots.txt', {root: path.join(process.cwd(), basePath)});
  });

  app.get('/privacy-policy', function(req, res) {
    defaultRoute(req, res);
  });

  app.get('/terms-of-service', function(req, res) {
    defaultRoute(req, res);
  });

  app.get('/search', function(req, res) {
     defaultRoute(req, res);
  });

  app.get('/new-publication', function(req, res){
    defaultRoute(req, res);
  });

  app.get('/edit-publication/:publicationId', function(req, res){
    defaultRoute(req, res);
  });

  app.get('/login', function(req, res){
    defaultRoute(req, res);
  });

  app.get('/account', function(req, res){
    defaultRoute(req, res);
  });

  //app.get('/view-publication/:id/:title', function(req, res){
  //
  //  getPublicationByUUDID(req.params.id)
  //    .then(function(publication){
  //
  //      // META TITLE
  //      // ***********************************
  //      var metaTitle = capitalize(publication.title).trim();
  //      metaTitle += publication.department === 'Real Estate'? ' for ' + publication.reHomeFor.toUpperCase() : '';
  //      metaTitle += ' - MarketOfLondon.co.uk';
  //      metaTags.title = metaTitle;
  //
  //      // META URL
  //      // ***********************************
  //      var metaURL = 'http://www.marketoflondon.co.uk/view-publication/';
  //      metaURL += publication.$id + '/';
  //      metaURL += slug(publication.title) + '.html';
  //      metaTags.url = metaURL;
  //
  //      // META Description
  //      // ***********************************
  //      metaTags.description = publication.description;
  //
  //      // META Image
  //      // ***********************************
  //      setMetaImage(publication.images, publication.featuredImageId);
  //
  //      return readFile('index1.html');
  //    })
  //    .then(function(the){
  //      var template = handlebars.compile(the.source.toString());
  //      return Q.when({result: template(metaTags)})
  //    })
  //    .then(function(the){
  //      res.send(the.result);
  //    },function(error){
  //      //throw error;
  //      res.redirect('/');
  //    });
  //
  //});

  // http://localhost:8080/walesServicesLTD

  app.get('/:accountName', function(req, res){

    getUserByAccountName(req.params.accountName)
      .then(function (user) {

        // META Title
        // ***********************************
        var metaTitle = 'Look @';
        metaTitle += typeof user.accountName !== 'undefined' && user.accountName !== '' ? user.accountName : user.$id;
        metaTitle += ' Publications in Market of London';
        metaTags.title = metaTitle;

        // META URL
        // ***********************************
        var metaURL = 'http://www.marketoflondon.co.uk/';
        metaURL += typeof user.accountName !== 'undefined' && user.accountName !== '' ? user.accountName : user.$id;
        metaTags.url = metaURL;

        // META Description
        // ***********************************
        metaTags.description = typeof user.bio !== 'undefined' && user.bio !== '' ? lodashTruncates(user.bio, 159) : 'MarketOfLondon.co.uk - Jobs, Real Estate, Transport, Services, Marketplace related Publications';

        // META image
        // ***********************************
        setMetaImage(user.images, user.featuredImageId);

        // META twitter
        // ***********************************
        metaTags.twitterAccount = typeof user.twitterAccount !== 'undefined' && user.twitterAccount !== '' ? '@' + user.twitterAccount : metaTags.twitterAccount;

        return readFile('index1.html');
      })
      .then(function(the){
        var template = handlebars.compile(the.source.toString());
        return Q.when({result: template(metaTags)})
      })
      .then(function(the){
        metaTags = {
          title:          'Market of London - Jobs Classified Ads - UK',
          url:            'http://www.marketoflondon.co.uk',
          description:    'Share easily your brand and offers of jobs in social networks, also publications of services, transports, real estate, and marketplace items.',
          image:          'http://res.cloudinary.com/berlin/image/upload/c_fill,e_sepia:77,h_630,q_auto:best,w_1200/v1471288313/Market_Of_London_share_image_xan9wg.webp',
          twitterAccount: '@MarketOfLondon'
        };
        res.send(the.result);
      },function(){
        res.redirect('/');
      });

  });

  /**
   * Example url: http://localhost:8080/walesServicesLTD/transport-specialized-in-scotland-central-scotland/-KIz5P7HuvRD7k6D8rPB/wethepeople-envy-35.html
  */
  app.get('/:accountName/:categoriesAndLocations/:publicationID/:title', function(req, res){

    var publication = {};
    var user = {};

    getPublicationByUUDID(req.params.publicationID)
      .then(function(_publication_){
        publication = _publication_;
        return getUserByUUID(publication.userID);
      })
      .then(function(_user_){
        user = _user_;

        // META TITLE
        // ***********************************
        var metaTitle = capitalize(publication.title).trim();
        metaTitle += publication.department === 'Real Estate'? ' for ' + publication.reHomeFor.toUpperCase() : '';
        metaTitle += ' - Market of London';
        metaTags.title = metaTitle;

        // META URL
        // ***********************************
        var metaURL = 'http://www.marketoflondon.co.uk/';

        /*
         locations: [ 'Scotland', 'North East Scotland', 'Dundee East' ],
         categories: [ 'Transport', 'Specialized', 'Others' ],
         */
        var categoriesAndLocations = '';
        var categories = _.join(publication.categories, ' ');
        var locations  = _.join(publication.locations, ' ');
        categoriesAndLocations += categories;
        categoriesAndLocations += ' in ';
        categoriesAndLocations += locations;

        metaURL += typeof user.accountName !== 'undefined' && user.accountName !== '' ? user.accountName + '/': user.$id + '/';
        metaURL += slug(categoriesAndLocations) + '/';
        metaURL += publication.$id + '/';
        metaURL += slug(publication.title) + '.html';
        metaTags.url = metaURL;

        metaTags.twitterURL = 'http://www.marketoflondon.co.uk/v/l/' + publication.$id + '/t';

        // META Description
        // ***********************************
        metaTags.description = lodashTruncates(publication.description, 159);

        // META Image
        // ***********************************
        setMetaImage(publication.images, publication.featuredImageId);

        // META twitter
        // ***********************************
        metaTags.twitterAccount = typeof user.twitterAccount !== 'undefined' && user.twitterAccount !== '' ? '@' + user.twitterAccount : metaTags.twitterAccount;

        return readFile('index1.html');
      })
      .then(function(the){
        var template = handlebars.compile(the.source.toString());
        return Q.when({result: template(metaTags)});
      })
      .then(function(the){
        metaTags = {
          title:          'Market of London - Jobs Classified Ads - UK',
          url:            'http://www.marketoflondon.co.uk',
          description:    'Share easily your brand and offers of jobs in social networks, also publications of services, transports, real estate, and marketplace items.',
          image:          'http://res.cloudinary.com/berlin/image/upload/c_fill,e_sepia:77,h_630,q_auto:best,w_1200/v1471288313/Market_Of_London_share_image_xan9wg.webp',
          twitterAccount: '@MarketOfLondon'
        };
        res.send(the.result);
      },function(error){
        //throw error;
        res.redirect('/');
      });

  });

  app.get('*', function(req, res){
    defaultRoute(req, res);
  });

};
