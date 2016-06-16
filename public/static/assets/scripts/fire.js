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

//
//.directive('ngHideAuth', ['FireAuth', '$timeout', function (FireAuth, $timeout) {
//  return {
//    restrict: 'A',
//    link: function(scope, el) {
//      el.addClass('ng-cloak'); // hide until we process it
//      function update() {
//        // sometimes if ngCloak exists on same element, they argue, so make sure that
//        // this one always runs last for reliability
//        $timeout(function () {
//          //$log.log('\n ngHideAuth directive Auth.$getAuth()',Auth.$getAuth());
//          //$log.log('ngHideAuth directive !!Auth.$getAuth()',!!Auth.$getAuth());
//          el.toggleClass('ng-cloak', !!FireAuth.$getAuth());
//        }, 0);
//      }
//
//      FireAuth.$onAuth(update);
//      update();
//    }
//  };
//}])
//  .directive('ngShowAuth', ['FireAuth', '$timeout', function (FireAuth, $timeout) {
//    //  A directive that shows elements only when user is logged out. It also waits for Auth to be initialized so there is no initial flashing of incorrect state.
//    return {
//      restrict: 'A',
//      link: function(scope, el) {
//        el.addClass('ng-cloak'); // hide until we process it
//
//        function update() {
//          // sometimes if ngCloak exists on same element, they argue, so make sure that
//          // this one always runs last for reliability
//          $timeout(function () {
//            //$log.log('\n ngShowAuth directive Auth.$getAuth()',Auth.$getAuth());
//            //$log.log('ngShowAuth directive !Auth.$getAuth()',!Auth.$getAuth());
//            el.toggleClass('ng-cloak', !FireAuth.$getAuth());
//          }, 0);
//        }
//
//        FireAuth.$onAuth(update);
//        update();
//      }
//    };
