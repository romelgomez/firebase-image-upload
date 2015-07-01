'use strict';

angular.module('categories',['ngMessages','cgBusy','jlareau.pnotify'])
  .directive('tree',['$templateCache','$compile',function($templateCache,$compile){

    var controller = function($scope){
      /**
       @Name          packAsJqTreeNode
       @visibility    Private
       @Description   Source node is packed as JqTree node.
       @parameters    {sourceNode: object}
       @return        Object
       @implementedBy sourceDataAsJqTreeData();
       */
      var packAsJqTreeNode = function(sourceNode){
        var node = {};
        node.id         = sourceNode.$id;
        node.label      = sourceNode.properties.name;
        node.parentId   = sourceNode.properties.parentId;
        node.left       = sourceNode.properties.left;
        node.right      = sourceNode.properties.right;
        node.children   = [];
        return node;
      };

      /**
       @Name          insertChildNode
       @visibility    Private
       @Description   Recursive Method; (EN) Is like push(), only that this function completely traverses the tree looking for the father to the son or node  (ES) Hace las veces de push(), solo que esta función recorre el árbol completamente buscando el padre para el hijo o nodo.
       Para el objeto actual, si se detecta que es un objeto dependiente, se mapea recursivamente targetTree, donde si id del objeto dependiente es igual al el objeto para el momento en el bucle recursivo, quiere decir que tal objeto dependiente es hijo del objeto actual.
       @parameters    {targetTree: Array,childNode: Object}
       @returns       null
       @implementedBy sourceDataAsJqTreeData();
       */
      var insertChildNode = function(targetTree,childNode){
        angular.forEach(targetTree,function(node){
          if(node.$id == childNode.parentId){
            node.children.push(childNode);
          }else{
            if(node.children.length > 0){
              insertChildNode(node.children,childNode);
            }
          }
        });
        return null;
      };

      /**
       @Name        sourceDataAsJqTreeData
       @Description Format source data array as JqTree data.
       @parameters  {sourceData: Array}
       @returns     Array
       */
      $scope.sourceDataAsJqTreeData = function(sourceData){
        var targetTree = [];
        angular.forEach(sourceData, function(obj){
          var node  = packAsJqTreeNode(obj);
          if(node.parentId != ''){
            // Is child node
            // Recursive Function
            insertChildNode(targetTree,node);
          }else{
            // Is root node
            // Se inserta el nodo directamente
            targetTree.push(node);
          }
        });
        return targetTree;
      };

    };

    return {
      restrict:'E',
      scope: {
        'nodes':'@',
        'jqTreeData':[]
      },
      controller:controller,
      link:function(scope,element){

        if(typeof scope.nodes ===  'undefined'){
          throw { message: 'attrs nodes is not defined' };
        }

        scope.$watch('nodes', function(){
          var template = '';
          switch(scope.type) {
            case 'published':
              if(scope.publications.length > 0){
                template = 'tree.html';
              }else{
                template = 'noTree.html';
              }
              break;
          }

          scope.jqTreeData = scope.sourceDataAsJqTreeData(scope.nodes);

          element.html($compile($templateCache.get(template))(scope));
        });

      }
    };
  }])
  .controller('CategoriesController',['$scope','$firebaseArray','FireRef','notificationService','$window','$log',function($scope,$firebaseArray,FireRef,notificationService,$window,$log){

    var categoriesRef  = FireRef.child('categories');
    $scope.categories = $firebaseArray(categoriesRef);


    $scope.logThis = function(){

      angular.forEach($scope.categories, function(value){
        $log.log(value);
      });

      var obj = [
        {name:'laptop 0',left:'1',right:'2'},
        {name:'laptop 1',left:'3',right:'4'},
        {name:'laptop 2',left:'5',right:'6'}
      ];

    };



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
      $scope.httpRequestPromise = $scope.categories.$remove(record).then(function(ref){
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
