'use strict';

angular.module('publications',['tree'])
  .controller('PublicationsController',['$scope','tree',function($scope,tree){

     $scope.nodes = tree.nodes();

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
    //  {
    //    "left": 2,
    //    "name": "13213",
    //    "parentId": "-Jtj9bAlDopYZTwv_PNU",
    //    "right": 3,
    //    "$id": "-Jtj9amY5zx6qI44qyQZ",
    //    "$priority": null
    //  },
    //  {
    //    "left": 5,
    //    "name": "321",
    //    "parentId": "",
    //    "right": 8,
    //    "$id": "-Jtj9b_08EA4ZZQ99RkE",
    //    "$priority": null
    //  },
    //  {
    //    "left": 6,
    //    "name": "321",
    //    "parentId": "-Jtj9b_08EA4ZZQ99RkE",
    //    "right": 7,
    //    "$id": "-Jtj9bzU_5USlURo_DcP",
    //    "$priority": null
    //  },
    //  {
    //    "left": 9,
    //    "name": "ok",
    //    "parentId": "",
    //    "right": 10,
    //    "$id": "-JtkjbSVfnUgORmfgNA7",
    //    "$priority": null
    //  }
    //];



  }]);
