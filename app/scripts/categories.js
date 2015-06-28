'use strict';

angular.module('categories',['ngMessages','cgBusy','jlareau.pnotify'])
  .controller('CategoriesController',['$scope','$firebaseArray','FireRef','$log',function($scope,$firebaseArray,FireRef,$log){

    $scope.categories = $firebaseArray(FireRef.child('categories'));

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

        var categoriesLength = $scope.categories.length;
        var left, right;

        if(categoriesLength >= 1){
          var upperLimit = categoriesLength * 2;
          left    = upperLimit+1;
          right   = upperLimit+2;
        }else{
          left    = 1;
          right   = 2;
        }

        var properties = {
            "left":     left,
            "right":    right,
            "parentId": '',
            "name":     $scope.model.category
        };

        $scope.categories.$add({properties: properties});

        $scope.reset();

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
