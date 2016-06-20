'use strict';

angular.module('login',['ngMessages','validation.match','trTrustpass','ngPasswordStrength'])
  .controller('LoginController', ['$scope','FireAuth','$location','$q','FireRef','notificationService','$window','$log',function ($scope, FireAuth, $location, $q, FireRef, notificationService, $window, $log) {
    // Manages authentication to any active providers.

    var original = angular.copy($scope.model = {
      signIn:{
        email:'',
        password:'',
        rememberMe: false
      },
      register:{
        names:'',
        lastNames:'',
        email:'',
        password:'',
        samePassword:''
      },
      recoverAccount:{
        email:''
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

    function redirect(){
      $window.location = '/new-publication'
    }

    /**
     * show error
     * @param {Object} error
     **/
    function showError(error) {

      switch (error.code) {
        case 'auth/invalid-email':
          notificationService.error('The email is invalid.');
          break;
        case 'auth/user-disabled':
          notificationService.error('This account has been suspended');
          break;
        case 'auth/user-not-found':
          notificationService.error('There is not user for this email.');
          break;
        case 'auth/wrong-password':
          notificationService.error('The password is invalid');
          break;
        default:
          notificationService.error('Undefined Error');
      }

    }

    /**
     * Create the profile
     * @param {Object} firebaseUser
     **/
    function createProfile(firebaseUser) {
      var deferred  = $q.defer();

      var reference = FireRef.child('users').child(firebaseUser.uid);

      var profile = {};

      reference.once('value', function(snapshot) {
        var exists = (snapshot.val() !== null);

        if(!exists){
          switch(user.provider) {
            case 'facebook':
              profile.names     = user['facebook'].displayName;
              profile.provider  = user.provider;
              profile.startedAt = Firebase.ServerValue.TIMESTAMP;
              break;
            case 'twitter':
              profile.names           = user['twitter'].displayName;
              profile.twitterAccount  = user['twitter'].username;
              profile.provider        = user.provider;
              profile.startedAt       = Firebase.ServerValue.TIMESTAMP;
              break;
            case 'password':
              profile.email     = $scope.model.register.email;
              profile.names     = $scope.model.register.names;
              profile.lastNames = $scope.model.register.lastNames;
              profile.provider  = user.provider;
              profile.startedAt = Firebase.ServerValue.TIMESTAMP;
              break;
          }

          reference.set(profile, function(error) {
            if (error) {
              deferred.reject(error);
            } else {
              deferred.resolve();
            }
          });

        }else{
          deferred.resolve();
        }

      });

      return deferred.promise;
    }

    $scope.register = function(){
      $scope.forms.register.$setSubmitted(true);
      if($scope.forms.register.$valid){

        $scope.httpRequestPromise = FireAuth.$createUserWithEmailAndPassword({email: $scope.model.register.email, password: $scope.model.register.password})
          //.then(function(firebaseUser){
          //  return createProfile(firebaseUser)
          //})
          .then(redirect, showError);

      }
    };

    $scope.signIn = function(){
      $scope.forms.signIn.$setSubmitted(true);
      if($scope.forms.signIn.$valid){

        $scope.httpRequestPromise  = FireAuth.$signInWithEmailAndPassword({email: $scope.model.signIn.email, password: $scope.model.signIn.password})
          .then(redirect, showError);

      }
    };

    $scope.recover = function(){
      $scope.forms.recoverAccount.$setSubmitted(true);
      if($scope.forms.recoverAccount.$valid){

        $scope.httpRequestPromise = FireAuth.$sendPasswordResetEmail($scope.model.recoverAccount.email)
          .then(function(){
            notificationService.success('Password reset email sent successfully!');
          },function(error){
            showError(error);
          });

      }
    };

    $scope.oauthLogin = function(provider) {

      FireAuth.$signInWithPopup(provider)
        //.then(function(result){
        //  return createProfile(result.user);
        //})
        .then(redirect, showError);

    };

  }]);
