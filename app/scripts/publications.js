'use strict';

angular.module('publications',['tree'])
  .controller('PublicationsController',['$scope','tree','notificationService',function($scope,tree,notificationService){

    $scope.nodes = tree.nodes();

    $scope.httpRequestPromise = $scope.nodes.$loaded(null,function(error){
      notificationService.error(error);
    });

    $scope.getChildren = function(nodeId){
      var children = [];
      angular.forEach($scope.nodes,function(node){
        if(node.parentId === nodeId){
          children.push(node);
        }
      });
      return children;
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
