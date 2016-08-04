'use strict';

$.cloudinary.config().cloud_name = 'berlin';

angular.module('account',['trTrustpass','ngPasswordStrength','cloudinary','algoliasearch','images'])
  .controller('AccountController',['$scope', '$q', 'user', '$uibModal', 'FireRef', '$firebaseObject', 'notificationService', '$log', function ($scope, $q, user, $uibModal, FireRef, $firebaseObject, notificationService, $log) {

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
        //modalErrors(error);
      });
    };

    $scope.adminProfileBanners = function(size){
      var modalInstance = $uibModal.open({
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

      modalInstance.result.then(function () {
        //notificationService.success('The profile banners has been updated.');
      }, function (error) {
        //modalErrors(error);
      });
    };

    $scope.adminProfileImages = function(size){
      var modalInstance = $uibModal.open({
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

      modalInstance.result.then(function () {
        //notificationService.success('The profile images has been updated.');
      }, function (error) {
        //modalErrors(error);
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
        //modalErrors(error);
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
        //modalErrors(error);
      });
    };

    $scope.unlinkProvider = function(providerId){

      $scope.httpRequestPromise = $scope.firebaseUser.unlink(providerId)
        .then(function(){
          notificationService.success('The provider has been unlink.');
        }, function (error) {
          notificationService.error(error);
        });

    };


  }])
  .controller('AccountBillingController',['$scope', function($scope){

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
  .controller('AccountProfilePasswordModalController',['$scope','$uibModalInstance','FireAuth','profile',function($scope, $uibModalInstance, FireAuth, profile){

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
            $uibModalInstance.close();
          }, function(error){
            $uibModalInstance.dismiss(error);
          });

      }
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss();
    };

  }])
  .controller('AccountProfileEmailModalController',['$q', '$scope', '$uibModalInstance', 'FireAuth', 'profile',function( $q, $scope, $uibModalInstance, FireAuth, profile){

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
            $uibModalInstance.close();
            deferred.resolve();
          }, function(error){
            $uibModalInstance.dismiss(error);
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

          $q.all([
              FireRef.child('accountNames').child(userInput).once('value'),
              FireRef.child('users').child($scope.profile.$id).child('accountName').once('value')
            ])
            .then(function(snapshots){

              //console.log('snapshots[0].val()', snapshots[0].val());
              //console.log('snapshots[0].key()', snapshots[0].key());
              //console.log('snapshots[1].val()', snapshots[1].val());
              //console.log('snapshots[1].key()', snapshots[1].key());
              //console.log('----------------------------------------');

              /*
               snapshots[0].val() is userID in accountNames path e.g accountNames/londonServicesLTD/userID
               snapshots[0].key() is accountName key in accountNames e.g accountNames/londonServicesLTD

               snapshots[1].val() is the current accountName value in user/userID/accountName e.g londonServicesLTD
               snapshots[1].key() is 'accountName' key in user/userID/
              */

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

          return deferred.promise;
        }
      }
    }

  }]);
