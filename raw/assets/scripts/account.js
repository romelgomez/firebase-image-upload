'use strict';

angular.module('account',['trTrustpass','ngPasswordStrength'])
  .controller('AccountController',['$scope','user', '$uibModal', 'FireRef', '$firebaseObject', 'notificationService', '$log',function ($scope, user, $uibModal, FireRef, $firebaseObject, notificationService, $log) {

    $scope.user = user;

    $scope.profile = $firebaseObject(FireRef.child('users/'+user.uid));

    $scope.httpRequestPromise = $scope.profile.$loaded(null,function(error){
      notificationService.error(error);
    });

    $scope.changeProfileDetails = function(size){
      var modalInstance = $uibModal.open({
        templateUrl: 'profileDetailsModal.html',
        controller: 'ProfileDetailsController',
        size: size,
        resolve: {
          profile: function () {
            return $scope.profile;
          }
        }
      });

      modalInstance.result.then(function () {
        notificationService.success('The profile has been updated.');
      }, function (error) {
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
      });
    };

    $scope.changePassword = function(size){
      $uibModal.open({
        templateUrl: 'accountPasswordModal.html',
        controller: 'AccountPasswordController',
        size: size
      });
    };

    $scope.changeEmail = function(size){
      $uibModal.open({
        templateUrl: 'emailAccountModal.html',
        controller: 'EmailAccountController',
        size: size
      });
    };

    // Provides rudimentary account management functions.
    //$scope.logout = function() { FireAuth.$unauth(); };
    //
    //$scope.messages = [];
    //
    //var profile = $firebaseObject(FireRef.child('users/'+user.uid));
    //
    //profile.$bindTo($scope, 'profile');
    //
    //
    //$scope.changePassword = function(oldPass, newPass, confirm) {
    //  $scope.err = null;
    //  if( !oldPass || !newPass ) {
    //    error('Please enter all fields');
    //  }
    //  else if( newPass !== confirm ) {
    //    error('Passwords do not match');
    //  }
    //  else {
    //    FireAuth.$changePassword({email: profile.email, oldPassword: oldPass, newPassword: newPass})
    //      .then(function() {
    //        success('Password changed');
    //      }, error);
    //  }
    //};
    //
    //$scope.changeEmail = function(pass, newEmail) {
    //  $scope.err = null;
    //  FireAuth.$changeEmail({password: pass, newEmail: newEmail, oldEmail: profile.email})
    //    .then(function() {
    //      profile.email = newEmail;
    //      profile.$save();
    //      success('Email changed');
    //    })
    //    .catch(error);
    //};
    //
    //function error(err) {
    //  alert(err, 'danger');
    //}
    //
    //function success(msg) {
    //  alert(msg, 'success');
    //}
    //
    //function alert(msg, type) {
    //  var obj = {text: msg+'', type: type};
    //  $scope.messages.unshift(obj);
    //  $timeout(function() {
    //    $scope.messages.splice($scope.messages.indexOf(obj), 1);
    //  }, 10000);
    //}

  }])
  .controller('ProfileDetailsController',['$scope','$modalInstance', 'profile', '$log',function($scope, $modalInstance, profile, $log){

    $scope.forms = {
      profileDetails: {}
    };

    var original = angular.copy($scope.model = {
      profileDetails:{
        names:                angular.isDefined(profile.names) && profile.names !== '' ? profile.names : '',
        lastNames:            angular.isDefined(profile.lastNames) && profile.lastNames !== '' ? profile.lastNames : '',
        mobilePhone:          angular.isDefined(profile.mobilePhone) && profile.mobilePhone !== '' ? profile.mobilePhone : '',
        landLineTelephone:    angular.isDefined(profile.landLineTelephone) && profile.landLineTelephone !== '' ? profile.landLineTelephone : ''
      }
    });

    $scope.submit = function(){
      if($scope.forms.profileDetails.$valid){

        profile.names             = $scope.model.profileDetails.names;
        profile.lastNames         = $scope.model.profileDetails.lastNames;
        profile.mobilePhone       = $scope.model.profileDetails.mobilePhone;
        profile.landLineTelephone = $scope.model.profileDetails.landLineTelephone;
        profile.$save()
          .then(function() {
            $modalInstance.close();
          }, function(error) {
            $modalInstance.dismiss(error);
          });

        $log.info('ok fromJson', angular.fromJson($scope.model.profileDetails));
        $log.info('ok toJson', angular.toJson($scope.model.profileDetails));
      }
    };

    $scope.cancel = function () {
      $modalInstance.dismiss();
    };

  }])
  .controller('AccountPasswordController',['$scope','$modalInstance',function($scope,$modalInstance){

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

      }
    };

    $scope.cancel = function () {
      $modalInstance.dismiss();
    };

  }])
  .controller('EmailAccountController',['$scope','$modalInstance',function($scope,$modalInstance){

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
