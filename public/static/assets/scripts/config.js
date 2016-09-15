'use strict';

//$.cloudinary.config().cloud_name = 'berlin';
// http://stackoverflow.com/questions/20663076/angularjs-app-run-documentation

/**
 * Site configuration
 ****************************/
angular.module('siteConfig',[])
  .constant('SITE_URL', 'http://www.marketoflondon.co.uk')
  .constant('SITE_TITLE', 'Market of London - Jobs Classified Ads - UK')
  .constant('SITE_CURRENCY_SYMBOL', '£')
  .constant('CLOUDINARY_CLOUD_NAME', 'berlin')
  .constant('CLOUDINARY_URL', 'https://api.cloudinary.com/v1_1/berlin/upload')
  .constant('CLOUDINARY_UPLOAD_PRESET', 'ebdyaimw')
  .constant('ALGOLIA_APPLICATION_ID', 'FU6V8V2Y6Q')
  .constant('ALGOLIA_API_KEY', '75b635c7c8656803b0b9e82e0510f266')
  .constant('FACEBOOK_API_ID', '1717304911824824')
  .constant('FACEBOOK_SDK_VERSION', 'v2.7')
  .constant('FIRE_BASE_CONFIG', {
    apiKey: 'AIzaSyBAuBLwxWaynoLI6AQeR60k9xPG5JnIgTA',
    authDomain: 'berlin.firebaseapp.com',
    databaseURL: 'https://berlin.firebaseio.com',
    storageBucket: 'project-966415674961578791.appspot.com'
  })
  .config(['FIRE_BASE_CONFIG', function (FIRE_BASE_CONFIG) {
    firebase.initializeApp(FIRE_BASE_CONFIG);
  }])
  .factory('FireAuth', ['$firebaseAuth', function($firebaseAuth) {
    return $firebaseAuth();
  }])
  .factory('FireRef', ['$window', function($window) {
    return $window.firebase.database().ref();
  }])
  .run(function(){
    var googleAppID = 'UA-74513768-1';

    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

    ga('create', googleAppID, 'auto');
    ga('send', 'pageview');
  });