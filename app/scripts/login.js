'use strict';

angular.module('login',['ngMessages','moreFilters','angular-loading-bar','validation.match'])
  .controller('LoginController', ['$scope','FireAuth','$location','$q','FireRef','$timeout','$log',function ($scope, FireAuth, $location, $q, FireRef, $timeout, $log) {
    // Manages authentication to any active providers.

    var original = angular.copy($scope.model = {
      signIn:{
        'email':'',
        'password':''
      },
      register:{
        'name':'',
        'lastName':'',
        'email':'',
        'password':'',
        'samePassword':''
      },
      recoverAccount:{
        'email':''
      }
    });

    $scope.forms = {
      signIn: {},
      register:{},
      recoverAccount:{}
    };

    $scope.resetRegisterForm = function(){
      angular.copy(original.register,$scope.model.register);
      $scope.forms.register.$setUntouched();
      $scope.forms.register.$setPristine();
    };

    $scope.resetSignInForm = function(){
      angular.copy(original.signIn,$scope.model.signIn);
      $scope.forms.signIn.$setUntouched();
      $scope.forms.signIn.$setPristine();
    };

    $scope.register = function(){
      $scope.forms.register.$setSubmitted(true);
      if($scope.forms.register.$valid){
        $log.info('ok fromJson', angular.fromJson($scope.model.register));
        $log.info('ok toJson', angular.toJson($scope.model.register));
      }
    };

    $scope.signIn = function(){
      $scope.forms.signIn.$setSubmitted(true);
      if($scope.forms.signIn.$valid){
        $log.info('ok fromJson', angular.fromJson($scope.model.signIn));
        $log.info('ok toJson', angular.toJson($scope.model.signIn));
      }
    };

    $scope.recover = function(){
      $scope.forms.recoverAccount.$setSubmitted(true);
      if($scope.forms.recoverAccount.$valid){
        $log.info('ok fromJson', angular.fromJson($scope.model.recoverAccount));
        $log.info('ok toJson', angular.toJson($scope.model.recoverAccount));
      }
    };

    //$scope.oauthLogin = function(provider) {
    //  $scope.err = null;
    //  FireAuth.$authWithOAuthPopup(provider, {rememberMe: true}).then(redirect, showError);
    //};
    //
    //$scope.anonymousLogin = function() {
    //  $scope.err = null;
    //  FireAuth.$authAnonymously({rememberMe: true}).then(redirect, showError);
    //};
    //
    //$scope.passwordLogin = function(email, pass) {
    //  $scope.err = null;
    //  FireAuth.$authWithPassword({email: email, password: pass}, {rememberMe: true}).then(
    //    redirect, showError
    //  );
    //};
    //
    //$scope.createAccount = function(email, pass, confirm) {
    //  $scope.err = null;
    //  if( !pass ) {
    //    $scope.err = 'Please enter a password';
    //  }
    //  else if( pass !== confirm ) {
    //    $scope.err = 'Passwords do not match';
    //  }
    //  else {
    //    FireAuth.$createUser({email: email, password: pass})
    //      .then(function () {
    //        // authenticate so we have permission to write to Firebase
    //        return FireAuth.$authWithPassword({email: email, password: pass}, {rememberMe: true});
    //      })
    //      .then(createProfile)
    //      .then(redirect, showError);
    //  }
    //
    //  function createProfile(user) {
    //    var ref = FireRef.child('users', user.uid), def = $q.defer();
    //    ref.set({email: email, name: firstPartOfEmail(email)}, function(err) {
    //      $timeout(function() {
    //        if( err ) {
    //          def.reject(err);
    //        }
    //        else {
    //          def.resolve(ref);
    //        }
    //      });
    //    });
    //    return def.promise;
    //  }
    //};
    //
    //function firstPartOfEmail(email) {
    //  return ucfirst(email.substr(0, email.indexOf('@'))||'');
    //}
    //
    //function ucfirst (str) {
    //  // inspired by: http://kevin.vanzonneveld.net
    //  str += '';
    //  var f = str.charAt(0).toUpperCase();
    //  return f + str.substr(1);
    //}
    //
    //
    //
    //function redirect() {
    //  $location.path('/account');
    //}
    //
    //function showError(err) {
    //  $scope.err = err;
    //}


  }]);
