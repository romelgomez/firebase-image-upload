'use strict';

$.cloudinary.config().cloud_name = 'berlin';


angular.module('account',['trTrustpass','ngPasswordStrength','cloudinary'])
  .controller('AccountController',['$scope', '$q', 'user', '$uibModal', 'FireRef', '$firebaseObject', 'notificationService', '$log', function ($scope, $q, user, $uibModal, FireRef, $firebaseObject, notificationService, $log) {

    $scope.account = {
      user:user,
      profile: $firebaseObject(FireRef.child('users/'+user.uid)),
      publications: {},
      publicationsImages: {}
    };

  }])
  .controller('AccountPublicationsController',['$scope', '$q', 'FireRef', '$firebaseObject', '$firebaseArray','$timeout', '$location', '$log', function( $scope, $q, FireRef, $firebaseObject, $firebaseArray, $timeout, $location, $log){

    var publicationImages = function(publicationId){
      var deferred = $q.defer();

      var publicationImagesRef = FireRef.child('images').child(publicationId);
      var publicationImages    = $firebaseArray(publicationImagesRef);

      publicationImages.$loaded(function(){
        $scope.account.publicationsImages[publicationId] = publicationImages;
        deferred.resolve();
      },function(error){
        deferred.reject(error);
      });

      return deferred.promise;
    };

    var getPublicationsImages = function(publications){
      var publicationsImagesPromises = {};

      angular.forEach(publications, function(publication){
        publicationsImagesPromises[publication.$id] = publicationImages(publication.$id)
      });

      return $q.all(publicationsImagesPromises);
    };

    var accountPublications = function(){
      var deferred = $q.defer();

      var userPublicationsRef = FireRef.child('publications');

      var query = userPublicationsRef.orderByChild('releaseDate');

      var publications = $firebaseArray(query);

      publications.$loaded(function () {
        return getPublicationsImages(publications);
      })
      .then(function(){
        $scope.account.publications = publications;
        deferred.resolve();
      },function(error){
        deferred.reject(error);
      });

      return deferred.promise;
    };

    var accountPublications2 = function(){
      var deferred = $q.defer();

      //var userPublicationsRef = FireRef.child('publications');
      //
      //var query = userPublicationsRef.orderByChild('releaseDate');
      //
      //var publications = $firebaseArray(query);
      //
      //publications.$loaded(function () {
      //  return getPublicationsImages(publications);
      //})
      //.then(function(){
      //  $scope.account.publications = publications;
      //  deferred.resolve();
      //},function(error){
      //  deferred.reject(error);
      //});

      return deferred.promise;
    };

    $scope.httpRequestPromise = accountPublications();

    $scope.editPublication = function (publicationId) {
      $location.path('/edit-publication/'+publicationId);
    };

    $scope.viewPublication = function (publicationId) {
      $location.path('/view-publication/'+publicationId);
    };

  }])
  .controller('AccountProfileController',['$scope', '$uibModal','notificationService',function($scope, $uibModal, notificationService){

    $scope.account.httpRequestPromise = $scope.account.profile.$loaded(null,function(error){
      notificationService.error(error);
    });

    var modalErrors = function(error){
      switch(error) {
        case 'escape key press':
          notificationService.notice('This action was canceled by the user');
          break;
        case undefined:
          notificationService.notice('This action was canceled by the user');
          break;
        case 'backdrop click':
          notificationService.notice('This action was canceled by the user');
          break;
        default:
          notificationService.error(error);
      }
    };

    $scope.changeProfileDetails = function(size){
      var modalInstance = $uibModal.open({
        templateUrl: 'accountProfileDetailsModal.html',
        controller: 'AccountProfileDetailsModalController',
        size: size,
        resolve: {
          profile: function () {
            return $scope.account.profile;
          }
        }
      });

      modalInstance.result.then(function () {
        notificationService.success('The profile has been updated.');
      }, function (error) {
        modalErrors(error);
      });
    };

    $scope.changePassword = function(size){
      var modalInstance = $uibModal.open({
        templateUrl: 'accountProfilePasswordModal.html',
        controller: 'AccountProfilePasswordModalController',
        size: size,
        resolve: {
          profile: function () {
            return $scope.account.profile;
          }
        }
      });

      modalInstance.result.then(function () {
        notificationService.success('The password has been updated.');
      }, function (error) {
        modalErrors(error);
      });
    };

    $scope.changeEmail = function(size){
      var modalInstance = $uibModal.open({
        templateUrl: 'accountProfileEmailModal.html',
        controller: 'AccountProfileEmailModalController',
        size: size,
        resolve: {
          profile: function () {
            return $scope.account.profile;
          }
        }
      });

      modalInstance.result.then(function () {
        notificationService.success('The email has been updated.');
      }, function (error) {
        modalErrors(error);
      });
    };


  }])
  .controller('AccountBillingController',['$scope', function($scope){

  }])
  .controller('AccountProfileDetailsModalController',['$scope','$modalInstance', 'profile', function($scope, $modalInstance, profile){

    $scope.forms = {
      profileDetails: {}
    };

    $scope.profile = profile;

    var original = angular.copy($scope.model = {
      profileDetails:{
        names:                angular.isDefined(profile.names) && profile.names !== '' ? profile.names : '',
        lastNames:            angular.isDefined(profile.lastNames) && profile.lastNames !== '' ? profile.lastNames : '',
        mobilePhone:          angular.isDefined(profile.mobilePhone) && profile.mobilePhone !== '' ? profile.mobilePhone : '',
        landLineTelephone:    angular.isDefined(profile.landLineTelephone) && profile.landLineTelephone !== '' ? profile.landLineTelephone : '',
        email:                angular.isDefined(profile.email) && profile.email !== '' ? profile.email : ''
      }
    });

    $scope.submit = function(){
      if($scope.forms.profileDetails.$valid){

        profile.names             = $scope.model.profileDetails.names;
        profile.lastNames         = $scope.model.profileDetails.lastNames;
        profile.mobilePhone       = $scope.model.profileDetails.mobilePhone;
        profile.landLineTelephone = $scope.model.profileDetails.landLineTelephone;

        if(profile.provider !== 'password'){
          profile.email = angular.isDefined($scope.model.profileDetails.email) ? $scope.model.profileDetails.email : '';
        }

        $scope.httpRequestPromise = profile.$save()
          .then(function() {
            $modalInstance.close();
          }, function(error) {
            $modalInstance.dismiss(error);
          });

      }
    };

    $scope.cancel = function () {
      $modalInstance.dismiss();
    };

  }])
  .controller('AccountProfilePasswordModalController',['$scope','$modalInstance','FireAuth','profile',function($scope, $modalInstance, FireAuth, profile){

    $scope.forms = {
      accountPassword: {}
    };

    var original = angular.copy($scope.model = {
      accountPassword:{
        oldPassword:'',
        newPassword:'',
        sameNewPassword:''
      }
    });

    $scope.submit = function(){
      if($scope.forms.accountPassword.$valid){

        $scope.httpRequestPromise = FireAuth.$changePassword({email: profile.email, oldPassword: $scope.model.accountPassword.oldPassword, newPassword: $scope.model.accountPassword.newPassword})
          .then(function() {
            $modalInstance.close();
          }, function(error){
            $modalInstance.dismiss(error);
          });

      }
    };

    $scope.cancel = function () {
      $modalInstance.dismiss();
    };

  }])
  .controller('AccountProfileEmailModalController',['$q', '$scope', '$modalInstance', 'FireAuth', 'profile',function( $q, $scope, $modalInstance, FireAuth, profile){

    $scope.forms = {
      emailAccount: {}
    };

    var original = angular.copy($scope.model = {
      emailAccount:{
        newEmail:'',
        password:''
      }
    });

    $scope.submit = function(){
      if($scope.forms.emailAccount.$valid){
        var deferred  = $q.defer();
        $scope.httpRequestPromise = deferred.promise;

        FireAuth.$changeEmail({password: $scope.model.emailAccount.password, newEmail: $scope.model.emailAccount.newEmail, oldEmail: profile.email})
          .then(function() {
            profile.email = $scope.model.emailAccount.newEmail;
            return profile.$save();
          })
          .then(function() {
            $modalInstance.close();
            deferred.resolve();
          }, function(error){
            $modalInstance.dismiss(error);
            deferred.reject(error);
          });

      }
    };

    $scope.resetForm = function(){
      angular.copy(original.emailAccount,$scope.model.emailAccount);
      $scope.forms.emailAccount.$setUntouched();
      $scope.forms.emailAccount.$setPristine();
    };

    $scope.cancel = function () {
      $modalInstance.dismiss();
    };

  }]);
