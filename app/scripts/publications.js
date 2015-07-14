'use strict';

angular.module('publications',['tree','filters','ngMessages','angular-redactor'])
  .factory('publications',['$q','FireRef','notificationService','$filter',function($q,FireRef,notificationService,$filter){

    var publicationsRef = function(){
      return FireRef.child('publications');
    };

  }])
  .controller('PublicationsController',['$scope','tree','notificationService','$filter','$log',function($scope,tree,notificationService,$filter,$log){

    $scope.nodes = tree.nodes();

    $scope.httpRequestPromise = $scope.nodes.$loaded(null,function(error){
      notificationService.error(error);
    });

    $scope.category = '';

    $scope.categoryExpected = false;

    $scope.path = [];

    $scope.setCategory = function (categoryId) {
      $scope.category   = categoryId;
      $scope.path       = tree.getPath(categoryId,$scope.nodes);
    };

    var original = angular.copy($scope.model = {
      title: null,
      description: null,
      price: null,
      quantity: null
    });

    $scope.reset = function(){
      $scope.model = angular.copy(original);
      $scope.form.$setUntouched();
      $scope.form.$setPristine();
    };

    $scope.submit = function () {
      if($scope.form.$valid){

        $log.log('$scope.model',$scope.model);

        //$scope.httpRequestPromise = $scope.nodes.$add(node).then(function() {
        //  notificationService.success('Data has been saved to our Firebase database');
        //  $scope.reset();
        //},function(error){
        //  notificationService.error(error);
        //  //$window.location = '/';
        //});

      }
    };

    $scope.saveDraft = function(){

    };


    //var publications = [
    //  {
    //    "left": 1,
    //    "name": "321",
    //    "parentId": "",
    //    "right": 4,
    //    "$id": "-Jtj9bAlDopYZTwv_PNU",
    //    "$priority": null
    //  },



  }]);
