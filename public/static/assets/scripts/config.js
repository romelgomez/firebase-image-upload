'use strict';

/**
 * Site configuration
 ****************************/
angular.module('projectConfig',[])
  .constant('CLOUDINARY_CLOUD_NAME', 'berlin')
  .constant('CLOUDINARY_URL', 'https://api.cloudinary.com/v1_1/berlin/upload')
  .constant('CLOUDINARY_UPLOAD_PRESET', 'ebdyaimw')
  .constant('CLOUDINARY_SITE_DEFAULT_IMAGES', {
    uploadImagesDirective:{
      loading:{
        jpg:'https://res.cloudinary.com/berlin/image/upload/q_auto:low/v1471973179/loading_esicpm.jpg',
        webp:'https://res.cloudinary.com/berlin/image/upload/q_auto:low/v1471973179/loading_esicpm.webp'
      },
      invalidImage:{
        jpg:'https://res.cloudinary.com/berlin/image/upload/q_auto:low/v1471973179/invalid_image_azvsxw.jpg',
        webp:'https://res.cloudinary.com/berlin/image/upload/q_auto:low/v1471973179/invalid_image_azvsxw.webp'
      }
    }
  })
  .constant('FIRE_BASE_CONFIG', {
    apiKey: 'AIzaSyBAuBLwxWaynoLI6AQeR60k9xPG5JnIgTA',
    authDomain: 'berlin.firebaseapp.com',
    databaseURL: 'https://berlin.firebaseio.com',
    storageBucket: 'project-966415674961578791.appspot.com'
  })
  .config(['FIRE_BASE_CONFIG', function (FIRE_BASE_CONFIG) {
    firebase.initializeApp(FIRE_BASE_CONFIG);
  }])
  .factory('FireRef', ['$window', function($window) {
    return $window.firebase.database().ref();
  }]);