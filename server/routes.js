var path = require('path');
var fs = require('fs');
var Q = require('q');
var handlebars = require('handlebars');

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
  title:          'MarketOfLondon.co.uk - Jobs, Real Estate, Transport, Services, Marketplace related Publications',
  url:            'http://www.marketoflondon.co.uk',
  description:    'Jobs, Real Estate, Transport, Services, Marketplace related Publications',
  image:          'http://res.cloudinary.com/berlin/image/upload/c_scale,e_sepia:77,h_630,q_100,w_1200/v1471288313/Market_Of_London_share_image_xan9wg.jpg',
  twitterAccount: '@MarketOfLondon'
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
      var user = snapshot.val();
      user.$id = snapshot.key;

      if(snapshot.exists()){
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

  metaTags.image = $images.length > 0? ('http://res.cloudinary.com/berlin/image/upload/c_fill,h_630,w_1200/'+ $images[0].$id +'.jpg') : metaTags.image;
}

function defaultRoute(req, res){
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
}

module.exports = function(app) {

  app.get('/', function(req, res) {
     defaultRoute(req, res);
  });

  // 2Checkout Approved URL
  app.post('/thank-you', function(req, res) {

    /*

     Header Redirect (Your URL)
     app.get('/thank-you')
     GET /thank-you?middle_initial=&sid=901325544&fixed=N&cart_weight=0&key=AA86C2002853AC30B0BDAED7090C8D15&state=monagas&last_name=&email=bmxquiksilver7185%40gmail.com&city=maturin&street_address=Urb.+Las+trinitarias+calle+10+casa+561&product_id=1&merchant_order_id=&order_number=9093731393217&country=VEN&ip_country=Venezuela&product_description=MarketOfLondon.co.uk+VIP+Account&lang=en&currency_code=GBP&demo=&pay_method=CC&invoice_id=9093731393226&quantity=1&cart_tangible=N&phone=4129427966+4129427966&total=259.00&credit_card_processed=Y&zip=&merchant_product_id=VIP&street_address2=&card_holder_name=Romel&first_name=Romel 200 59.020 ms - 5758

     Given links back to my website
     app.post('/thank-you')

     FRAUD_STATUS_CHANGED
     ORDER_CREATED
     INVOICE_STATUS_CHANGED invoice_status: 'deposited'

    */

    console.log('');
    console.log('************************************ 2Checkout Approved URL *********************************************');
    console.log('2Checkout Approved URL req.method:', req.method);
    console.log('2Checkout Approved URL req.url:', req.url);
    console.log('2Checkout Approved URL req.body: \n', req.body);
    console.log('#################################### 2Checkout Approved URL ##############################################');
    console.log('');

    defaultRoute(req, res);
  });

  // 2Checkout Instant Notification Service
  app.post('/2co-ins', function(req, res) {

    console.log('');
    console.log('************************************ 2Checkout Instant Notification Service *********************************************');
    console.log('2Checkout Instant Notification Service req:', req.method);
    console.log('2Checkout Instant Notification Service req:', req.url);
    console.log('2Checkout Instant Notification Service req: \n', req.body);
    console.log('#################################### 2Checkout Instant Notification Service ##############################################');
    console.log('');

    defaultRoute(req, res);
  });


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

  app.get('/categories', function(req, res){
    defaultRoute(req, res);
  });

  app.get('/locations', function(req, res){
    defaultRoute(req, res);
  });

  app.get('/j-tree-test', function(req, res){
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

  app.get('/view-publication/:id/:title', function(req, res){

    getPublicationByUUDID(req.params.id)
      .then(function(publication){

        // META TITLE
        // ***********************************
        var metaTitle = capitalize(publication.title).trim();
        metaTitle += publication.department === 'Real Estate'? ' for ' + publication.reHomeFor.toUpperCase() : '';
        metaTitle += ' - MarketOfLondon.co.uk';
        metaTags.title = metaTitle;

        // META URL
        // ***********************************
        var metaURL = 'http://www.marketoflondon.co.uk/view-publication/';
        metaURL += publication.$id + '/';
        metaURL += slug(publication.title) + '.html';
        metaTags.url = metaURL;

        // META Description
        // ***********************************
        metaTags.description = publication.description;

        // META Image
        // ***********************************
        setMetaImage(publication.images, publication.featuredImageId);

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

    getUserByAccountName(req.params.accountName)
      .then(function (user) {

        // META Title
        // ***********************************
        var metaTitle = 'Look @';
        metaTitle += typeof user.accountName !== 'undefined' && user.accountName !== '' ? user.accountName : user.$id;
        metaTitle += ' Publications in MarketOfLondon.co.uk';
        metaTags.title = metaTitle;

        // META URL
        // ***********************************
        var metaURL = 'http://www.marketoflondon.co.uk/';
        metaURL += typeof user.accountName !== 'undefined' && user.accountName !== '' ? user.accountName : user.$id;
        metaTags.url = metaURL;

        // META Description
        // ***********************************
        metaTags.description = typeof user.bio !== 'undefined' && user.bio !== '' ? user.bio : 'MarketOfLondon.co.uk - Jobs, Real Estate, Transport, Services, Marketplace related Publications';

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
        metaTitle += ' - MarketOfLondon.co.uk';
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

        // META Description
        // ***********************************
        metaTags.description = publication.description;

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
