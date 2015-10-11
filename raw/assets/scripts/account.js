'use strict';

angular.module('account',[])
  .controller('AccountController',['$scope','user', '$uibModal', function ($scope, user, $uibModal) {

    $scope.user = user;

    $scope.changeProfileDetails = function(size){
      $uibModal.open({
        templateUrl: 'changeProfileDetailsModal.html',
        controller: 'ChangeProfileDetailsController',
        size: size
      });
    };

    $scope.changePassword = function(size){
      $uibModal.open({
        templateUrl: 'changePasswordModal.html',
        controller: 'ChangeAccountPasswordController',
        size: size
      });
    };

    $scope.changeEmail = function(size){
      $uibModal.open({
        templateUrl: 'changeEmailModal.html',
        controller: 'ChangeEmailAccountController',
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
  .controller('ChangeProfileDetailsController',['$scope','$modalInstance',function($scope,$modalInstance){

    //var original = angular.copy($scope.model = {
    //  signIn:{
    //    email:'',
    //    password:'',
    //    rememberMe: false
    //  },
    //  register:{
    //    names:'',
    //    lastNames:'',
    //    email:'',
    //    password:'',
    //    samePassword:''
    //  },
    //  recoverAccount:{
    //    email:''
    //  }
    //});


    $scope.cancel = function () {
      $modalInstance.dismiss();
    };

  }])
  .controller('ChangeAccountPasswordController',['$scope',function($scope){


    $scope.cancel = function () {
      $modalInstance.dismiss();
    };

  }])
  .controller('ChangeEmailAccountController',['$scope',function($scope){


    $scope.cancel = function () {
      $modalInstance.dismiss();
    };

  }]);
