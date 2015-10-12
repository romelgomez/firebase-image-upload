'use strict';

angular.module('account',['trTrustpass','ngPasswordStrength'])
  .controller('AccountController',['$scope','user', '$uibModal', function ($scope, user, $uibModal) {

    $scope.user = user;

    $scope.changeProfileDetails = function(size){
      $uibModal.open({
        templateUrl: 'profileDetailsModal.html',
        controller: 'ProfileDetailsController',
        size: size
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
  .controller('ProfileDetailsController',['$scope','$modalInstance',function($scope,$modalInstance){

    $scope.forms = {
      profileDetails: {}
    };

    var original = angular.copy($scope.model = {
      profileDetails:{
        names:'',
        lastNames:'',
        mobilePhone:'',
        landLineTelephone:''
      }
    });

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

    $scope.cancel = function () {
      $modalInstance.dismiss();
    };

  }]);
