'use strict';

//$.cloudinary.config().cloud_name = 'berlin';
// http://stackoverflow.com/questions/20663076/angularjs-app-run-documentation

/**
 * Site configuration
 ****************************/
angular.module('siteConfig',[])
  .constant('SITE_URL', 'http://www.marketoflondon.co.uk')
  .constant('SITE_TITLE', 'Market of London - Jobs Classified Ads - UK')
  .constant('SITE_EMAIL', '')
  .constant('SITE_TWITTER', 'marketoflondon')
  .constant('SITE_CURRENCY_SYMBOL', '£')
  .constant('CLOUDINARY_CLOUD_NAME', 'berlin')
  .constant('CLOUDINARY_URL', 'https://api.cloudinary.com/v1_1/berlin/upload')
  .constant('CLOUDINARY_UPLOAD_PRESET', 'ebdyaimw')
  .constant('CLOUDINARY_SITE_DEFAULT_IMAGES', {
    accountBanner: {
      jpg : 'https://res.cloudinary.com/berlin/image/upload/c_fill,h_617,q_auto:best,w_2000/v1471962346/iceland_q4qb4e.jpg',
      webp : 'https://res.cloudinary.com/berlin/image/upload/c_fill,h_617,q_auto:best,w_2000/v1471962346/iceland_q4qb4e.webp'
    },
    accountProfileImage:{
      jpg: 'https://res.cloudinary.com/berlin/image/upload/c_scale,w_400/v1471961823/unnamedPerson_diuaor.jpg',
      webp: 'https://res.cloudinary.com/berlin/image/upload/c_scale,w_400/v1471961823/unnamedPerson_diuaor.webp'
    },
    uploadImagesDirective:{
      loading:{
        jpg:'https://res.cloudinary.com/berlin/image/upload/q_auto:low/v1471973179/loading_esicpm.jpg',
        webp:'https://res.cloudinary.com/berlin/image/upload/q_auto:low/v1471973179/loading_esicpm.webp'
      },
      invalidImage:{
        jpg:'https://res.cloudinary.com/berlin/image/upload/q_auto:low/v1471973179/invalid_image_azvsxw.jpg',
        webp:'https://res.cloudinary.com/berlin/image/upload/q_auto:low/v1471973179/invalid_image_azvsxw.webp'
      }
    },
    publicationsListDirective:{
      anyTypePublicationsBanner:{
        jpg:'https://res.cloudinary.com/berlin/image/upload/q_auto:low/v1471975218/publications-banner-2_nw8ung.jpg',
        webp:'https://res.cloudinary.com/berlin/image/upload/q_auto:low/v1471975218/publications-banner-2_nw8ung.webp'
      },
      shortcutsBanners: {
        jobs:{
          jpg:'https://res.cloudinary.com/berlin/image/upload/c_scale,q_auto:eco,w_300/v1471980275/jobs-banner-4_narvua.jpg',
          webp:'https://res.cloudinary.com/berlin/image/upload/c_scale,q_auto:eco,w_300/v1471980275/jobs-banner-4_narvua.webp'
        },
        transport:{
          jpg:'https://res.cloudinary.com/berlin/image/upload/c_scale,q_auto:eco,w_300/v1471982509/transport-banner-2_jl6n1a.jpg',
          webp:'https://res.cloudinary.com/berlin/image/upload/c_scale,q_auto:eco,w_300/v1471982509/transport-banner-2_jl6n1a.webp'
        },
        realState:{
          jpg:'https://res.cloudinary.com/berlin/image/upload/c_scale,q_auto:eco,w_300/v1471983285/real-state-banner_syinid.jpg',
          webp:'https://res.cloudinary.com/berlin/image/upload/c_scale,q_auto:eco,w_300/v1471983285/real-state-banner_syinid.webp'
        },
        services:{
          jpg:'https://res.cloudinary.com/berlin/image/upload/c_scale,q_auto:eco,w_300/v1471986618/services-banner_g45sqe.jpg',
          webp:'https://res.cloudinary.com/berlin/image/upload/c_scale,q_auto:eco,w_300/v1471986618/services-banner_g45sqe.webp'
        },
        marketplace:{
          jpg:'https://res.cloudinary.com/berlin/image/upload/c_scale,q_auto:eco,w_300/v1471991348/site/marketplace-banner-3_bhqftd.jpg',
          webp:'https://res.cloudinary.com/berlin/image/upload/c_scale,q_auto:eco,w_300/v1471991348/site/marketplace-banner-3_bhqftd.webp'
        }
      },
      noImageAvailableBig:{
        jpg:'https://res.cloudinary.com/berlin/image/upload/c_fill,h_400,q_auto:low,w_700/noImageAvailableBig_lxxmuu.jpg',
        webp:'https://res.cloudinary.com/berlin/image/upload/c_fill,h_400,q_auto:low,w_700/noImageAvailableBig_lxxmuu.webp'
      },
      algoliaLogo:{
        jpg:'https://res.cloudinary.com/berlin/image/upload/c_scale,q_auto:low,w_70/v1472131370/Algolia_logo_bg-white_jn2n2w.jpg',
        webp:'https://res.cloudinary.com/berlin/image/upload/c_scale,q_auto:low,w_70/v1472131370/Algolia_logo_bg-white_jn2n2w.webp'
      }
    }
  })
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
    /**
     * Google Analytics App ID
     */
    var googleAppID = 'UA-74513768-1';

    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

    ga('create', googleAppID, 'auto');
    ga('send', 'pageview');
  });