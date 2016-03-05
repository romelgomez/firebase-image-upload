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

    var redirect = function(){
      $window.location = '#!/new-publication'
    };

    /**
     * show error
     * @param {Object} error
     **/
    var showError = function(error) {

      switch (error.code) {
        case 'AUTHENTICATION_DISABLED':
          notificationService.error('The requested authentication provider is disabled for this Firebase application.');
          break;
        case 'EMAIL_TAKEN':
          notificationService.error('The new user account cannot be created because the email is already in use.');
          break;
        case 'INVALID_ARGUMENTS':
          notificationService.error('The specified credentials are malformed or incomplete. Please refer to the error message, error details, and Firebase documentation for the required arguments for authenticating with this provider.');
          break;
        case 'INVALID_CONFIGURATION':
          notificationService.error('The requested authentication provider is misconfigured, and the request cannot complete. Please confirm that the provider \'s client ID and secret are correct in your App Dashboard and the app is properly set up on the provider \'s website.');
          break;
        case 'INVALID_CREDENTIALS':
          notificationService.error('The requested authentication provider is misconfigured, and the request cannot complete. Please confirm that the provider \'s client ID and secret are correct in your App Dashboard and the app is properly set up on the provider \'s website.');
          break;
        case 'INVALID_EMAIL':
          notificationService.error('The specified email is not a valid email.');
          break;
        case 'INVALID_ORIGIN':
          notificationService.error('A security error occurred while processing the authentication request. The web origin for the request is not in your list of approved request origins. To approve this origin, visit the Login & Auth tab in your App Dashboard.');
          break;
        case 'INVALID_PASSWORD':
          notificationService.error('The specified user account password is incorrect.');
          break;
        case 'INVALID_PROVIDER':
          notificationService.error('The requested authentication provider does not exist. Please consult the Firebase Authentication documentation for a list of supported providers.');
          break;
        case 'INVALID_TOKEN':
          notificationService.error('The specified authentication token is invalid. This can occur when the token is malformed, expired, or the Firebase app secret that was used to generate it has been revoked.');
          break;
        case 'INVALID_USER':
          notificationService.error('The specified user account does not exist.');
          break;
        case 'NETWORK_ERROR':
          notificationService.error('An error occurred while attempting to contact the authentication server.');
          break;
        case 'PROVIDER_ERROR':
          notificationService.error('A third-party provider error occurred. Please refer to the error message and error details for more information.');
          break;
        case 'TRANSPORT_UNAVAILABLE':
          notificationService.error('The requested login method is not available in the user\'s browser environment. Popups are not available in Chrome for iOS, iOS Preview Panes, or local, file:// URLs. Redirects are not available in PhoneGap / Cordova, or local, file:// URLs.');
          break;
        case 'UNKNOWN_ERROR':
          notificationService.error('An unknown error occurred. Please refer to the error message and error details for more information.');
          break;
        case 'USER_CANCELLED':
          notificationService.error('The current authentication request was cancelled by the user.');
          break;
        case 'USER_DENIED':
          notificationService.error('The user did not authorize the application. This error can occur when the user has cancelled an OAuth authentication request.');
          break;
        default:
          notificationService.error('Undefined Error: ',error);
      }

    };

    /**
     * create the profile
     * @param {Object} user
     **/
    var createProfile = function (user) {
      var deferred  = $q.defer();

      var reference = FireRef.child('users').child(user.uid);

      var profile = {};

      reference.once('value', function(snapshot) {
        var exists = (snapshot.val() !== null);

        if(!exists){
          switch(user.provider) {
            case 'facebook':
              profile.names     = user['facebook'].displayName;
              profile.provider  = user.provider;
              break;
            case 'twitter':
              profile.names     = user['twitter'].displayName;
              profile.provider  = user.provider;
              break;
            case 'password':
              profile.email     = $scope.model.register.email;
              profile.names     = $scope.model.register.names;
              profile.lastNames = $scope.model.register.lastNames;
              profile.provider  = user.provider;
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

      //// TODO AÑADIR DATOS RELEVANTES AL PERFIL DEL USUARIO
      //$log.info('createProfile var user: ', user);
      //
      //return reference.set({
      //  email: $scope.model.register.email,
      //  names: $scope.model.register.names,
      //  lastNames: $scope.model.register.lastNames,
      //  provider:user.provider
      //});

      return deferred.promise;
    };

    /**
     * create the user
     * */
    var createUser = function(){
      var deferred  = $q.defer();

      FireAuth.$createUser({email: $scope.model.register.email, password: $scope.model.register.password})
          .then(function () {
            // Authenticate so we have permission to write to FireBase
            return FireAuth.$authWithPassword({email: $scope.model.register.email, password: $scope.model.register.password}, {rememberMe: true});
          })
          .then(createProfile)
          .then(function(){
            deferred.resolve();
          }, function(error){
            deferred.reject(error);
          });

      return deferred.promise;
    };

    $scope.register = function(){
      $scope.forms.register.$setSubmitted(true);
      if($scope.forms.register.$valid){

        $scope.httpRequestPromise = createUser()
            .then(function(){
              redirect();
            },function(error){
              showError(error);
            });

        //$log.info('ok fromJson', angular.fromJson($scope.model.register));
        //$log.info('ok toJson', angular.toJson($scope.model.register));
      }
    };

    var signIn  = function(){
      var deferred  = $q.defer();

      var remember = $scope.model.signIn.rememberMe ? 'default' : 'sessionOnly';

      FireAuth.$authWithPassword({email: $scope.model.signIn.email, password: $scope.model.signIn.password},{remember: remember})
          .then(function(authData){

            $log.info('authData', authData);

            deferred.resolve();
          },function(error){
            deferred.reject(error);
          });

      return deferred.promise;
    };

    $scope.signIn = function(){
      $scope.forms.signIn.$setSubmitted(true);
      if($scope.forms.signIn.$valid){

        $scope.httpRequestPromise = signIn()
            .then(function(){
              redirect();
            },function(error){
              showError(error);
            });

        $log.info('ok fromJson', angular.fromJson($scope.model.signIn));
        $log.info('ok toJson', angular.toJson($scope.model.signIn));

      }
    };

    var recover = function (){
      var deferred  = $q.defer();

      FireAuth.$resetPassword({
        email: $scope.model.recoverAccount.email
      }).then(function() {
        deferred.resolve();
      }).catch(function(error) {
        deferred.reject(error);
      });

      return deferred.promise;
    };

    $scope.recover = function(){
      $scope.forms.recoverAccount.$setSubmitted(true);
      if($scope.forms.recoverAccount.$valid){

        $scope.httpRequestPromise = recover()
            .then(function(){
              notificationService.success('Password reset email sent successfully!');
            },function(error){
              showError(error);
            });

        $log.info('ok fromJson', angular.fromJson($scope.model.recoverAccount));
        $log.info('ok toJson', angular.toJson($scope.model.recoverAccount));
      }
    };

    $scope.oauthLogin = function(provider) {
      FireAuth.$authWithOAuthPopup(provider, {rememberMe: true})
          .then(function(user){
            return createProfile(user);
          })
          .then(redirect, showError);
    };

  }]);
