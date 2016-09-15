'use strict';

angular.module('account',[])
  .controller('AccountController',['$scope', '$q', 'user', '$uibModal', 'FireRef', '$firebaseObject', function ($scope, $q, user, $uibModal, FireRef, $firebaseObject) {

    $scope.lording = {
      deferred: $q.defer(),
      isDone: false,
      promises: []
    };

    $scope.lording.promise = $scope.lording.deferred.promise;

    $scope.account = {
      user:user,
      profile: $firebaseObject(FireRef.child('users/'+user.uid)),
      publications: {},
      publicationsImages: {}
    };

  }])
  .controller('AccountProfileController',['$scope', '$uibModal','notificationService',function($scope, $uibModal, notificationService){

    $scope.lording.promises.push($scope.account.profile.$loaded());

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
      });
    };

    $scope.adminProfileBanners = function(size){
      $uibModal.open({
        templateUrl: 'accountProfileBannersModal.html',
        controller: 'accountProfileBannersModalController',
        size: size,
        resolve: {
          profile: function () {
            return $scope.account.profile;
          },
          user: function () {
            return $scope.account.user;
          }
        }
      });

    };

    $scope.adminProfileImages = function(size){
      $uibModal.open({
        templateUrl: 'accountProfileImagesModal.html',
        controller: 'accountProfileImagesModalController',
        size: size,
        resolve: {
          profile: function () {
            return $scope.account.profile;
          },
          user: function () {
            return $scope.account.user;
          }
        }
      });
    };

  }])
  .controller('AccountProfileDetailsModalController',['$scope','$uibModalInstance', '$q', 'profile' , 'FireRef', function($scope, $uibModalInstance, $q, profile, FireRef){

    $scope.forms = {
      profileDetails: {}
    };

    $scope.profile = profile;

    $scope.model = {
      accountName:          angular.isDefined(profile.accountName) && profile.accountName !== '' ? profile.accountName : '',
      pseudonym:            angular.isDefined(profile.pseudonym) && profile.pseudonym !== '' ? profile.pseudonym : '',
      bio:                  angular.isDefined(profile.bio) && profile.bio !== '' ? profile.bio : '',
      names:                angular.isDefined(profile.names) && profile.names !== '' ? profile.names : '',
      lastNames:            angular.isDefined(profile.lastNames) && profile.lastNames !== '' ? profile.lastNames : '',
      mobilePhone:          angular.isDefined(profile.mobilePhone) && profile.mobilePhone !== '' ? profile.mobilePhone : '',
      landLineTelephone:    angular.isDefined(profile.landLineTelephone) && profile.landLineTelephone !== '' ? profile.landLineTelephone : '',
      email:                angular.isDefined(profile.email) && profile.email !== '' ? profile.email : '',
      twitterAccount:       angular.isDefined(profile.twitterAccount) && profile.twitterAccount !== '' ? profile.twitterAccount : '',
      facebookAccount:      angular.isDefined(profile.facebookAccount) && profile.facebookAccount !== '' ? profile.facebookAccount : ''
    };

    $scope.submit = function(){
      if($scope.forms.profileDetails.$valid){

        var promises = [];

        var accountName = profile.accountName;

        if(angular.isDefined(profile.accountName) && profile.accountName !== ''){
          promises.push(FireRef.child('accountNames').child(accountName).remove());
          promises.push(FireRef.child('accountNames').child(accountName.toLowerCase()).remove());
        }

        angular.forEach($scope.model, function(value, key){
          profile[key] = value;
        });

        promises.push(profile.$save());
        promises.push(FireRef.child('accountNames').child($scope.model.accountName).set(profile.$id));
        promises.push(FireRef.child('accountNames').child($scope.model.accountName.toLowerCase()).set(profile.$id));

        $scope.httpRequestPromise = $q.all(promises)
          .then(function() {
            $uibModalInstance.close();
          }, function(error) {
            $uibModalInstance.dismiss(error);
          });

      }
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss();
    };

  }])
  .controller('accountProfileImagesModalController',['$scope','$uibModalInstance', '$q', 'imagesService','profile', 'user', 'notificationService', function($scope, $uibModalInstance, $q, imagesService, profile, user, notificationService){

    $scope.forms = {
      profileImages: {}
    };

    $scope.profile = profile;
    $scope.profile.featuredImageId =  typeof $scope.profile.featuredImageId  !== 'undefined'? $scope.profile.featuredImageId  : '';
    $scope.user = user;
    $scope.images = [];

    $scope.imagesInfo = function() {
      return imagesService.imagesInfo($scope.images);
    };

    if(angular.isDefined($scope.profile.images) && Object.keys($scope.profile.images).length > 0){
      angular.forEach($scope.profile.images, function(value, key){
        value.$id = key;
        value.$ngfWidth   = value.width;
        value.$ngfHeight  = value.height;
        value.size        = typeof value.size !== 'undefined' ? value.size : value.bytes;
        value.isUploaded  = true;
        value.name        = typeof value.name !== 'undefined' ? value.name : value.original_filename + '.' + value.format;
        $scope.images.push(value);
      });
    }

    $scope.submit = function(){
      if($scope.forms.profileImages.$valid){

        $scope.httpRequestPromise = imagesService.uploadFiles($scope.images, 'profile-' +user.uid)
          .then(function (files) {
            profile.images = typeof profile.images !== 'undefined' ? profile.images : {};
            angular.forEach(files,function(fileData, fileID){
              profile.images[fileID] = fileData;
            });
            return profile.$save();
          })
          .then(function () {
            notificationService.success('The file(s) has been uploaded.');
          },function(error){
            notificationService.error(error);
          });

      }
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss();
    };

  }])
  .controller('accountProfileBannersModalController',['$scope','$uibModalInstance', '$q', 'imagesService','profile', 'user', 'notificationService', function($scope, $uibModalInstance, $q, imagesService, profile, user, notificationService){

    $scope.forms = {
      profileBanners: {}
    };

    $scope.profile = profile;
    $scope.profile.featuredBannerId =  typeof $scope.profile.featuredBannerId  !== 'undefined'? $scope.profile.featuredBannerId  : '';
    $scope.user = user;
    $scope.images = [];

    $scope.imagesInfo = function() {
      return imagesService.imagesInfo($scope.images);
    };

    if(angular.isDefined($scope.profile.banners) && Object.keys($scope.profile.banners).length > 0){
      angular.forEach($scope.profile.banners, function(value, key){
        value.$id = key;
        value.$ngfWidth   = value.width;
        value.$ngfHeight  = value.height;
        value.size        = typeof value.size !== 'undefined' ? value.size : value.bytes;
        value.isUploaded  = true;
        value.name        = typeof value.name !== 'undefined' ? value.name : value.original_filename + '.' + value.format;
        $scope.images.push(value);
      });
    }

    $scope.submit = function(){
      if($scope.forms.profileBanners.$valid){

        $scope.httpRequestPromise = imagesService.uploadFiles($scope.images, 'profile-banners-' +user.uid)
          .then(function (files) {
            profile.banners = typeof profile.banners !== 'undefined' ? profile.banners : {};
            angular.forEach(files,function(fileData, fileID){
              profile.banners[fileID] = fileData;
            });
            return profile.$save();
          })
          .then(function () {
            notificationService.success('The file(s) has been uploaded.');
          },function(error){
            notificationService.error(error);
          });

      }
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss();
    };

  }])
  .directive('isAccountNameAvailable',[ 'FireRef', '$q', function( FireRef, $q){

    return {
      require:'ngModel',
      scope:{
        profile:'=profile'
      },
      link:function($scope, element, attrs, ngModel){
        ngModel.$asyncValidators.isAccountNameAvailable = function(modelValue , viewValue) {
          var deferred  = $q.defer();

          var userInput = modelValue || viewValue;

          // url path, the url that are like this: some-case are not necessary include in this list, because the Account Names are formatted as camelCase
          var reservedWords = {
            search: true,
            features: true,
            categories: true,
            locations: true,
            login: true,
            account: true,
            upgrade: true
          };

          if(reservedWords[userInput.toLowerCase()] === true){
            deferred.reject(false);
          } else {

            $q.all([
                FireRef.child('accountNames').child(userInput).once('value'),
                FireRef.child('users').child($scope.profile.$id).child('accountName').once('value')
              ])
              .then(function(snapshots){

                if(!snapshots[0].exists()){
                  deferred.resolve(true);
                }else if(snapshots[0].val() === $scope.profile.$id){
                  deferred.resolve(true);
                }else{
                  deferred.reject(false);
                }

              },function(){
                deferred.reject(false);
              });

          }

          return deferred.promise;
        }
      }
    }

  }]);
