'use strict';

angular.module('app',[
    'angular-loading-bar',
    'filters',
    'validators',
    'firebase',
    'fire2',
    'routes',
    'tree',
    'publications',
    'login',
    'account',
    'ui.bootstrap',
    'main',
    'updateMeta',
    'accountPublications'
  ])
  .controller('AppController',[ '$scope', 'FireAuth',function( $scope, FireAuth){

    FireAuth.$onAuthStateChanged(function(firebaseUser) {
      if(firebaseUser){
        console.log('firebaseUser',
          'displayName: ' + firebaseUser.displayName + ', \n' +
          'email: ' + firebaseUser.email + ', \n' +
          'emailVerified: ' + firebaseUser.emailVerified + ', \n' +
          'isAnonymous: ' + firebaseUser.isAnonymous + ', \n' +
          'photoURL: ' + firebaseUser.photoURL + ', \n' +
          'providerData: ' + firebaseUser.providerData + ', \n' +
          'providerId: ' + firebaseUser.providerId + ', \n' +
          'refreshToken: ' + firebaseUser.refreshToken + ', \n' +
          'uid: ' + firebaseUser.uid
        );

        console.log('firebaseUser.providerData: ', firebaseUser.providerData);
        console.log('firebaseUser.providerData: ', firebaseUser.providerData[0]);


      }else{
        //console.log('firebaseUser', firebaseUser);
      }

      $scope.firebaseUser = firebaseUser;
    });

    //https://github.com/firebase/angularfire/blob/master/docs/guide/user-auth.md#retrieving-authentication-state

    $scope.logout = function() { FireAuth.$signOut(); };

    $scope.inProduction = false;

    $scope.sizeOf = function(obj) {
      if (typeof obj === 'undefined'){
        obj = {};
      }
      return Object.keys(obj).length;
    };

    $scope.firstObj = function (obj) {
      for (var key in obj) if (obj.hasOwnProperty(key)) return key;
    };

  }])
  .directive('facebook',['$window', function ($window) {

    return {
      restrict:'E',
      scope:{
        url:'='
      },
      template:''+
      '<div class="fb-like" data-href="{{url}}" data-layout="button_count" data-action="like" data-show-faces="true" data-share="true"></div>',
      link:function(scope){

        if (typeof $window.FB !== 'undefined'){
          scope.$watch(function(scope){
            return scope.url;
          },function(){
            $window.FB.XFBML.parse();
          });

        }

      }
    }

  }]);


