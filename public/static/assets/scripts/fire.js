'use strict';

//http://stackoverflow.com/questions/20663076/angularjs-app-run-documentation

angular.module('fire2',['firebase'])
  .constant('FIRE_BASE_CONFIG', {
    apiKey: "AIzaSyBAuBLwxWaynoLI6AQeR60k9xPG5JnIgTA",
    authDomain: "berlin.firebaseapp.com",
    databaseURL: "https://berlin.firebaseio.com",
    storageBucket: "project-966415674961578791.appspot.com"
  })
  .config(['FIRE_BASE_CONFIG', function (FIRE_BASE_CONFIG) {
    firebase.initializeApp(FIRE_BASE_CONFIG);
  }])
  .factory('FireAuth', ['$firebaseAuth', function($firebaseAuth) {
    return $firebaseAuth();
  }])
  .factory('FireRef', ['$window', function($window) {
    return $window.firebase.database().ref();
  }]);