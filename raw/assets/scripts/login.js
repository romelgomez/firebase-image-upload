'use strict';

angular.module('login',['ngMessages','angular-loading-bar','validation.match'])
  .controller('LoginController', ['$scope','FireAuth','$location','$q','FireRef','$timeout','$log',function ($scope, FireAuth, $location, $q, FireRef, $timeout, $log) {
    // Manages authentication to any active providers.

    var original = angular.copy($scope.model = {
      signIn:{
        'email':'',
        'password':''
      },
      register:{
        'names':'',
        'lastNames':'',
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

      var redirect = function(){
        $location.path('/#/new-publication')
      };

      var showError = function(error) {

        $log.info('showError var error: ',error);

        switch (error.code) {
          case "EMAIL_TAKEN":
            console.log("The new user account cannot be created because the email is already in use.");
            break;
          case "INVALID_EMAIL":
            console.log("The specified email is not a valid email.");
            break;
          default:
            console.log("Error creating user:", error);
        }

      };

      var createProfile = function (user) {
        $log.info('createProfile var user: ', user);

        var ref = FireRef.child('users', user.uid), def = $q.defer();

        ref.set({
          email: email,
          names: $scope.model.register.names,
          lastNames: $scope.model.register.lastNames
        }, function(error) {
          if(error){
            def.reject(error);
          }else {
            def.resolve(ref);
          }
        });

        return def.promise;
      };

      $scope.register = function(){
      $scope.forms.register.$setSubmitted(true);
      if($scope.forms.register.$valid){

            FireAuth.$createUser({email: $scope.model.register.email, password: $scope.model.register.password})
              .then(function () {
                // Authenticate so we have permission to write to FireBase
                return FireAuth.$authWithPassword({email: $scope.model.register.email, password: $scope.model.register.password}, {rememberMe: true});
              })
              .then(createProfile)
              .then(redirect, showError);


        //$scope.authObj.$createUser({
        //  email: "my@email.com",
        //  password: "mypassword"
        //}).then(function(userData) {
        //  console.log("User " + userData.uid + " created successfully!");
        //
        //  return $scope.authObj.$authWithPassword({
        //    email: "my@email.com",
        //    password: "mypassword"
        //  });
        //}).then(function(authData) {
        //  console.log("Logged in as:", authData.uid);
        //}).catch(function(error) {
        //  console.error("Error: ", error);
        //});

        //var ref = new Firebase("https://<YOUR-FIREBASE-APP>.firebaseio.com");
        //ref.authWithPassword({
        //  "email": "bobtony@firebase.com",
        //  "password": "correcthorsebatterystaple"
        //}, function(error, authData) {
        //  if (error) {
        //    console.log("Login Failed!", error);
        //  } else {
        //    console.log("Authenticated successfully with payload:", authData);
        //  }
        //});

        //var ref = new Firebase("https://<YOUR-FIREBASE-APP>.firebaseio.com");
        //ref.createUser({
        //  email: "bobtony@firebase.com",
        //  password: "correcthorsebatterystaple"
        //}, function(error, userData) {
        //  if (error) {
        //    switch (error.code) {
        //      case "EMAIL_TAKEN":
        //        console.log("The new user account cannot be created because the email is already in use.");
        //        break;
        //      case "INVALID_EMAIL":
        //        console.log("The specified email is not a valid email.");
        //        break;
        //      default:
        //        console.log("Error creating user:", error);
        //    }
        //  } else {
        //    console.log("Successfully created user account with uid:", userData.uid);
        //  }
        //});

        //$scope.authObj.$authWithPassword({
        //  email: "my@email.com",
        //  password: "mypassword"
        //}).then(function(authData) {
        //  console.log("Logged in as:", authData.uid);
        //}).catch(function(error) {
        //  console.error("Authentication failed:", error);
        //});

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
