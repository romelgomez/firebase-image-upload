'use strict';

angular.module('login',['ngMessages','moreFilters','angular-loading-bar','validation.match'])
  .controller('LoginController', ['$scope','FireAuth','$location','$q','FireRef','$timeout','$log',function ($scope, FireAuth, $location, $q, FireRef, $timeout, $log) {
    // Manages authentication to any active providers.

    var original = angular.copy($scope.model = {
      signIn:{
        'email':'',
        'password':''
      },
      registerForm:{
        'name':'',
        'lastName':'',
        'email':'',
        'password':'',
        'samePassword':''
      }
    });

    $scope.resetRegisterForm = function(){
      angular.copy(original.registerForm,$scope.model.registerForm);
      $scope.registerForm.$setUntouched();
      $scope.registerForm.$setPristine();

    };

    //$scope.reset = function(){
    //  $scope.model = angular.copy(original);
    //  $scope.form.$setUntouched();
    //  $scope.form.$setPristine();
    //};


    $scope.register = function(){
      $log.info($scope.registerForm);
      //if($scope.okForm.$valid){
      //  $log.info('ok fromJson', angular.fromJson($scope.model.registerForm));
      //  $log.info('ok toJson', angular.toJson($scope.model.registerForm));
      //}
    };

    $scope.oauthLogin = function(provider) {
      $scope.err = null;
      FireAuth.$authWithOAuthPopup(provider, {rememberMe: true}).then(redirect, showError);
    };

    $scope.anonymousLogin = function() {
      $scope.err = null;
      FireAuth.$authAnonymously({rememberMe: true}).then(redirect, showError);
    };

    $scope.passwordLogin = function(email, pass) {
      $scope.err = null;
      FireAuth.$authWithPassword({email: email, password: pass}, {rememberMe: true}).then(
        redirect, showError
      );
    };

    $scope.createAccount = function(email, pass, confirm) {
      $scope.err = null;
      if( !pass ) {
        $scope.err = 'Please enter a password';
      }
      else if( pass !== confirm ) {
        $scope.err = 'Passwords do not match';
      }
      else {
        FireAuth.$createUser({email: email, password: pass})
          .then(function () {
            // authenticate so we have permission to write to Firebase
            return FireAuth.$authWithPassword({email: email, password: pass}, {rememberMe: true});
          })
          .then(createProfile)
          .then(redirect, showError);
      }

      function createProfile(user) {
        var ref = FireRef.child('users', user.uid), def = $q.defer();
        ref.set({email: email, name: firstPartOfEmail(email)}, function(err) {
          $timeout(function() {
            if( err ) {
              def.reject(err);
            }
            else {
              def.resolve(ref);
            }
          });
        });
        return def.promise;
      }
    };

    function firstPartOfEmail(email) {
      return ucfirst(email.substr(0, email.indexOf('@'))||'');
    }

    function ucfirst (str) {
      // inspired by: http://kevin.vanzonneveld.net
      str += '';
      var f = str.charAt(0).toUpperCase();
      return f + str.substr(1);
    }



    function redirect() {
      $location.path('/account');
    }

    function showError(err) {
      $scope.err = err;
    }


  }]);
