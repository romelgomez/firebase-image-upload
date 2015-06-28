'use strict';

angular.module('oldLogin',['ngMessages','cgBusy','jlareau.pnotify','validation.match'])
  .controller('FormsController',['$scope','$modal',function($scope,$modal){
    $scope.recoverAccount = function (size) {
      $modal.open({
        templateUrl: 'recoverAccountModal.html',
        controller: 'RecoverAccountController',
        size: size
      });
    };
    $scope.newUser = function (size) {
      $modal.open({
        templateUrl: 'newUserModal.html',
        controller: 'NewUserController',
        size: size
      });
    };
    $scope.verifyEmail = function(size){
      $modal.open({
        templateUrl: 'verifyEmailModal.html',
        controller: 'VerifyEmailController',
        size: size
      });
    };
  }])
  .controller('LoginFormController',['$scope','$http','notificationService',function($scope,$http,notificationService) {

    $scope.model = {
      email: null,
      password: null
    };

    $scope.submit = function(){
      if($scope.form.$valid){
        $scope.httpRequestPromise = $http.post('/in', $scope.model).
          success(function(data) {
            if(data.status === 'success'){
              window.location = '/';
            }else{
              notificationService.error(data.message);
            }
          }).
          error(function() {
            window.location = '/';
          });
      }
    };

  }])
  .controller('NewPasswordController',['$scope','$http','notificationService',function($scope,$http,notificationService) {

    $scope.model = {
      password: null,
      passwordAgain: null
    };

    $scope.submit = function(){
      if($scope.form.$valid){
        $scope.httpRequestPromise = $http.post('/snp', $scope.model).
          success(function(data) {
            if(data.status === 'success'){

              notificationService.success('Listo, ahora intente iniciar sesión en su cuenta.');

//                            form.find('.form-group').hide();
//                            form.find('button').hide();


            }else{
              notificationService.error(data.message);
            }
          }).
          error(function() {
            window.location = '/';
          });
      }
    };

  }])
  .controller('RecoverAccountController',['$scope','$http','$modalInstance','notificationService',function($scope,$http,$modalInstance,notificationService){

    $scope.model = {
      email: null
    };

    $scope.submit = function () {
      if($scope.form.$valid){
        $scope.httpRequestPromise = $http.post('/recover-account', $scope.model).
          success(function(data) {
            if(data.status === 'success'){
              notificationService.success('Ya le enviamos un correo electrónico para que recupere su cuenta.');
              $modalInstance.close();
            }else{
              notificationService.error(data.message);
            }
          }).
          error(function() {
            window.location = '/';
          });
      }
    };

    $scope.cancel = function () {
      $modalInstance.dismiss();
    };

  }])
  .controller('NewUserController',['$scope','$http','$modalInstance','notificationService',function($scope,$http,$modalInstance,notificationService){

    $scope.model = {
      name: null,
      email: null,
      lastName: null,
      password: null,
      termsOfService: false
    };

    $scope.submit = function () {
      if($scope.form.$valid){
        $scope.httpRequestPromise = $http.post('/new-user', $scope.model).
          success(function(data) {
            if(data.status === 'success'){
              notificationService.success('Casi listo, le hemos enviado un correo para verificar y activar su cuenta.');
              $modalInstance.close();
            }else{
              notificationService.error(data.message);
            }
          }).
          error(function() {
            window.location = '/';
          });
      }
    };

    $scope.cancel = function () {
      $modalInstance.dismiss();
    };

  }])
  .controller('VerifyEmailController',['$scope','$http','$modalInstance','notificationService',function($scope,$http,$modalInstance,notificationService){

    $scope.model = {
      email: null
    };

    $scope.submit = function () {
      if($scope.form.$valid){
        $scope.httpRequestPromise = $http.post('/sea', $scope.model).
          success(function(data) {
            if(data.status === 'success'){
              notificationService.success('Ya hemos enviado otro correo electrónico para verificar su cuenta.');
              $modalInstance.close();
            }else{
              notificationService.error(data.message);
            }
          }).
          error(function() {
            window.location = '/';
          });
      }
    };

    $scope.cancel = function () {
      $modalInstance.dismiss();
    };

  }]);
