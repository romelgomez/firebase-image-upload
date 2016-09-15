'use strict';

angular.module('app',[
    'ngRoute',
    'siteConfig',
    'angular-loading-bar',
    'filters',
    'validators',
    'firebase',
    'routes',
    'cgBusy',
    'jlareau.pnotify',
    'publications',
    'login',
    'account',
    'ui.bootstrap',
    'main',
    'updateMeta',
    'accountPublications',
    'trTrustpass',
    'ngPasswordStrength',
    'cloudinary',
    'algoliasearch',
    'images',
    'ngMessages',
    'angular-redactor',
    'uuid',
    'ngFileUpload'
  ])
  .controller('AppController',[ '$scope', 'FireAuth', '$location',function( $scope, FireAuth, $location){

    FireAuth.$onAuthStateChanged(function(firebaseUser) {
      $scope.firebaseUser = firebaseUser;
    });

    $scope.$watch(function(){
      return $location.path();
    },function(){
      $scope.locationPath = $location.path();
    });

    $scope.logout = function() { FireAuth.$signOut(); };

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

        $window.fbAsyncInit = function() {
          FB.init({
            appId      : '1717304911824824',
            xfbml      : true,
            version    : 'v2.7'
          });
        };

        (function(d, s, id){
          var js, fjs = d.getElementsByTagName(s)[0];
          if (d.getElementById(id)) {return;}
          js = d.createElement(s); js.id = id;
          js.src = '//connect.facebook.net/en_GB/sdk.js#xfbml=1&version=v2.7&appId=762758047167957';
          fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));

        if (typeof $window.FB !== 'undefined'){
          scope.$watch(function(scope){
            return scope.url;
          },function(){
            $window.FB.XFBML.parse();
          });

        }

      }
    }

  }])
  .directive('customTwitterShareButton',['$window', '$timeout', function ($window, $timeout) {

    return {
      restrict:'E',
      replace: true,
      scope:{
        text:'=',
        url:'='
      },
      template:''+
      '<a class="twitter-share-button" href="https://twitter.com/intent/tweet?text={{text}}&via=marketoflondon&url={{url}}">Tweet</a>',
      link:function(){

        $timeout(function () {
          $window.twttr = (function(d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0],
              t = window.twttr || {};
            if (d.getElementById(id)) return t;
            js = d.createElement(s);
            js.id = id;
            js.src = 'https://platform.twitter.com/widgets.js';
            fjs.parentNode.insertBefore(js, fjs);

            t._e = [];
            t.ready = function(f) {
              t._e.push(f);
            };

            return t;
          }(document, 'script', 'twitter-wjs'));

          if(typeof $window.twttr.widgets !== 'undefined'){
            $window.twttr.widgets.load();
          }
        });

      }
    }

  }])
  .directive('inputFocus',[function(){
    return {
      restrict:'A',
      link : function(scope, element) {
        element.focus();
      }
    };
  }]);