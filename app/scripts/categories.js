'use strict';

angular.module('tree',['ngMessages','cgBusy','jlareau.pnotify'])
  .factory('tree',['$q','$firebaseArray','FireRef',function($q,$firebaseArray,FireRef){

    var treeRef = function(){
      return FireRef.child('tree');
    };

    return {
      ref:function(){
        return treeRef();
      },
      nodes:function(mockObj){

        //var deferred = $q.defer();
        //var promise = deferred.promise;
        //
        //var nodes = [
        //  {properties:{name:'Node 1',left:'1',right:'2',parentId:''},$id:'0',$priority:null},
        //  {properties:{name:'Node 2',left:'3',right:'4',parentId:''},$id:'1',$priority:null},
        //  {properties:{name:'Node 3',left:'5',right:'6',parentId:''},$id:'2',$priority:null},
        //  {properties:{name:'Node 4',left:'7',right:'12',parentId:''},$id:'3',$priority:null},
        //  {properties:{name:'Node 5',left:'8',right:'9',parentId:'3'},$id:'4',$priority:null},
        //  {properties:{name:'Node 6',left:'10',right:'11',parentId:'3'},$id:'5',$priority:null},
        //  {properties:{name:'Node 7',left:'13',right:'14',parentId:''},$id:'6',$priority:null}
        //];
        //return (mockObj) ? promise.then(function(nodes){return nodes},null) : $firebaseArray(treeRef());

        return $firebaseArray(treeRef());

      }
    };


  }])
  .directive('tree',['$templateCache','$compile','tree','$log',function($templateCache,$compile,tree,$log){

    var controller = function($scope){


      /**
       @Name            displayJqTreeData
       @Descripción     Display initially JqTree Data.
       @parameters      {element: reference of DOM element, data: object}
       @returns         null
       @implementedBy
       */
      $scope.displayJqTreeData = function(element,data){
        var options = {
          dragAndDrop: true,
          selectable: true,
          autoEscape: false,
          autoOpen: true,
          data: data
        };

        element.tree(options);
      };

      /**
       @Name         replaceWholeTree
       @Descripción  Replace whole Tree.
       @parameters   {element: reference of DOM element, data: object}
       @returns      null
       @implementedBy -> newCategory(), editCategoryName(), deleteCategory(), treeMove()
       */
      $scope.replaceWholeTree = function(element,data){
        element.tree('loadData', data);
      };

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
          if(node.id == childNode.parentId){
            node.children.push(childNode);
          }else{
            if(node.children.length > 0){
              insertChildNode(node.children,childNode);
            }
          }
        });
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
      scope: {},
      replace:true,
      controller:controller,
      template:'<div><pre>{{ nodes | json }}</pre> <pre>{{jqTreeData | json}}</pre><div/>',
      link:function(scope,element){

        scope.nodes       = tree.nodes();
        scope.jqTreeData  = [];

        scope.displayJqTreeData(element,scope.jqTreeData);

        scope.nodes.$watch(function(){
          scope.jqTreeData = scope.sourceDataAsJqTreeData(scope.nodes);

          scope.replaceWholeTree(element,scope.jqTreeData);

          //var template = '';
          //if(scope.nodes.length > 0){
          //  template = 'tree.html';
          //}else{
          //  template = 'noTree.html';
          //}
          //
          //element.html($compile($templateCache.get(template))(scope));
        });

     }
    };

  }])
  .controller('TreeController',['$scope','notificationService','$window','tree','$log',function($scope,notificationService,$window,tree,$log){

    $scope.nodes = tree.nodes();

    $scope.logThis = function(){
      angular.forEach($scope.nodes, function(value){
        $log.log(value);
      });
    };

    $scope.httpRequestPromise = $scope.nodes.$loaded(null,function(error){
      notificationService.error(error);
    });

    var original = angular.copy($scope.model = {
      node: null
    });

    $scope.reset = function(){
      $scope.model = angular.copy(original);
      $scope.form.$setUntouched();
      $scope.form.$setPristine();
    };

    $scope.deleteTree = function(){
      var onComplete = function(error) {
        if (error) {
          notificationService.error(error);
        } else {
          notificationService.success('The tree or nodes has been deleted');
        }
      };
      tree.ref().remove(onComplete);
    };

    $scope.deleteNode = function(record){
      $scope.httpRequestPromise = $scope.nodes.$remove(record).then(function(ref){
        //$log.log('ref: ',ref);
        notificationService.success('This category has been deleted');
      },function(error){
        notificationService.error(error);
      });
    };

    $scope.submit = function () {
      if($scope.form.$valid){

        $log.log($scope.model);

        var nodesLength = $scope.nodes.length;
        var left, right;

        if(nodesLength >= 1){
          var upperLimit = nodesLength * 2;
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
            "name":     $scope.model.node
        };

        $scope.httpRequestPromise = $scope.nodes.$add({properties: properties}).then(function() {
          notificationService.success('Data has been saved to our Firebase database');
          $scope.reset();
        },function(error){
          notificationService.error(error);
          //$window.location = '/';
        });

      }
    };


  }]);
