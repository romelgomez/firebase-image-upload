'use strict';

angular.module('categories',['ngMessages','cgBusy','jlareau.pnotify'])
  .controller('CategoriesController',['$scope','$log',function($scope,$log){

    var original = angular.copy($scope.model = {
      category: null
    });

    $scope.reset = function(){
      $scope.model = angular.copy(original);
      $scope.form.$setUntouched();
      $scope.form.$setPristine();
    };

    $scope.submit = function () {
      if($scope.form.$valid){

        $log.log($scope.model);

        //$scope.httpRequestPromise = $http.post('/new-user', $scope.model).
        //  success(function(data) {
        //    if(data['status'] === 'success'){
        //      notificationService.success('Casi listo, le hemos enviado un correo para verificar y activar su cuenta.');
        //      $modalInstance.close();
        //    }else{
        //      notificationService.error(data.message);
        //    }
        //  }).
        //  error(function() {
        //    window.location = "/";
        //  });
      }
    };

  }]);
