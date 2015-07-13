'use strict';

angular.module('publications',['tree','filters','ngMessages','angular-redactor'])
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
      $scope.path       = getPath(categoryId,$scope.nodes);
    };

    var getPath = function (nodeId,nodes){
      var path = [];
      var reverseNodes   = $filter('reverse')(nodes);
      var process = function (nodeId){
        angular.forEach(reverseNodes,function(node){
          if(nodeId === node.$id){
            path.push(node);
            if(node.parentId !== ''){
              process(node.parentId);
            }
          }
        });
      };
      process(nodeId);
      return $filter('reverse')(path);
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
