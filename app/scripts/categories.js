'use strict';

angular.module('categories',['ngMessages','cgBusy','jlareau.pnotify'])
  .factory('tree',[,function(){



    return null;
  }])
  .controller('CategoriesController',['$scope','$firebaseArray','FireRef','notificationService','$window','$log',function($scope,$firebaseArray,FireRef,notificationService,$window,$log){

    var categoriesRef  = FireRef.child('categories');
    $scope.categories = $firebaseArray(categoriesRef);


    $scope.httpRequestPromise = $scope.categories.$loaded()
      .then(null,function(error){
        notificationService.error(error);
      });


    var original = angular.copy($scope.model = {
      category: null
    });

    $scope.reset = function(){
      $scope.model = angular.copy(original);
      $scope.form.$setUntouched();
      $scope.form.$setPristine();
    };

    $scope.deleteAllCategories = function(){
      var onComplete = function(error) {
        if (error) {
          notificationService.error(error);
        } else {
          notificationService.success('All categories has been deleted');
        }
      };
      categoriesRef.remove(onComplete);
    };

    $scope.delete = function(record){
      $scope.categories.$remove(record).then(function(ref){
        $log.log('ref: ',ref);
        notificationService.success('This category has been deleted');
      },function(error){
        notificationService.error(error);
      });
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

        $scope.httpRequestPromise = $scope.categories.$add({properties: properties}).then(function() {
          notificationService.success('Data has been saved to our Firebase database');
          $scope.reset();
        },function(error){
          notificationService.error(error);
          //$window.location = '/';
        });


      }
    };





  }]);
