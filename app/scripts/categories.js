'use strict';

angular.module('tree',['ngMessages','cgBusy','jlareau.pnotify'])
  .factory('tree',['$q','$firebaseArray','FireRef','$log',function($q,$firebaseArray,FireRef,$log){

    var treeRef = function(){
      return FireRef.child('tree');
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
      node.label      = sourceNode.name;
      node.parentId   = sourceNode.parentId;
      node.left       = parseInt(sourceNode.left);
      node.right      = parseInt(sourceNode.right);
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

    return {
      ref:function(){
        return treeRef();
      },
      nodes:function(){


        //var messagesRef = new Firebase("https://berlin.firebaseio.com/elementsB");
        //// download the data from a Firebase database reference into a (pseudo read-only) array
        //
        //// create a query for the most recent 25 messages on the server
        //var query = messagesRef.orderByChild("left");
        //
        //// the $firebaseArray service properly handles Firebase database queries as well
        //$scope.logNodes = $firebaseArray(query);
        //

        return $firebaseArray(treeRef().orderByChild("left"));
      },
      updateAllTree:function(newTree){
        var ref = treeRef();
        ref.set(newTree);
      },
    /**
     @Name        sourceDataAsJqTreeData
     @Description Recursive Function, Format source data array as JqTree data.
     @parameters  {sourceData: Array}
     @returns     Array
     */
      sourceDataAsJqTreeData: function(sourceData){
      var targetTree = [];
      angular.forEach(sourceData, function(obj){
        var node  = packAsJqTreeNode(obj);
        if(node.parentId != ''){
          // Is child node
          //$log.log('Is child node');
          insertChildNode(targetTree,node);
        }else{
          // Is root node
          targetTree.push(node);
        }
      });
      return targetTree;
    },
    /**
     @Name              prepareDataForFireBase
     @Descripción       Recursive Method, Prepare data for FireBase data store.
     @parameters        {tree: object}
     @returns           object
     @implementedBy    deleteCategory(), treeMove();
     */
    prepareDataForFireBase: function(tree){
      var nodes = {};
      var process = function(tree){
        angular.forEach(tree,function(node){
          nodes[node.id]                      = {};
          nodes[node.id].name      = node.name;
          nodes[node.id].parentId  = node.parentId;
          nodes[node.id].left      = node.left;
          nodes[node.id].right     = node.right;
          if(node.children.length > 0){
            process(node.children);
          }
        });
      };
      process(tree);
      return nodes;
    },
    /**
     @Name            normalize
     @Descripción     Recursive Method, Fix .left and .right values of node of tree.
     @parameters      {tree:object}
     @returns         Null
     @implementedBy   deleteCategory(), treeMove();
     */
     normalize: function(tree){
      var count;
      var fix = function(tree,parentId){
        angular.forEach(tree,function(node){
          if(!count){ count = 1; }
          node.left = count; count +=1;
          if(parentId){
            node.parentId = parentId;
          }else{
            node.parentId = '';
          }
          if(node.children !== undefined && node.children.length >= 1){
            // There are child nodes
            fix(node.children,node.id);
          }else{
            node.children = [];
          }
          node.right = count; count +=1;
        });
      };
      fix(tree);
    }
  };


  }])
  .directive('tree',['$templateCache','$compile','tree','$log',function($templateCache,$compile,tree,$log){

    return {
      restrict:'E',
      scope: {},
      replace:true,
      template:'<div><div/>',
      link:function(scope,element){

        /**
         @Name            displayJqTreeData
         @Descripción     Display initially JqTree Data.
         @parameters      {element: reference of DOM element, data: object}
         @returns         null
         @implementedBy
         */
        var displayJqTreeData = function(element,data){
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
        var replaceWholeTree = function(element,data){
          element.tree('loadData', data);
        };


        /**
         @Name          nodes
         @Descripción   The real time data front fireBase
         */
        var nodes = tree.nodes();

        /**
         @Descripción   Displaying initially Data, which is []
         */
        displayJqTreeData(element,[]);

        /**
         @Descripción   Observing the move event
         */
        element.bind('tree.move',function(event) {

          event.preventDefault();
          event.move_info.do_move();

          var proposalTree = angular.fromJson(element.tree('toJson'));

          tree.normalize(proposalTree);

          //$log.log('proposalTree',angular.toJson(proposalTree));

          var newTree = tree.prepareDataForFireBase(proposalTree);

          //$log.log('after prepareDataForFireBase()',angular.toJson(newTree));

          tree.updateAllTree(newTree);

        });

        /**
         @Descripción   Observing the select event
         */
        element.bind('tree.select',function(event) {

            $log.log('event.node',event.node);

            //var adminCategory = $("#admin-category");

          }
        );


        /**
         @Descripción   Observing changes in nodes var, which has first [] empty array, after some time is get server data.
         */
        nodes.$watch(function(){

          replaceWholeTree(element,tree.sourceDataAsJqTreeData(nodes));

          $log.log('1');
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
  .controller('TreeController',['$scope','notificationService','$window','tree','$log','FireRef','$firebaseArray',function($scope,notificationService,$window,tree,$log,FireRef,$firebaseArray){

    $scope.nodes = tree.nodes();

    $scope.asJqTreeData = [];

    $scope.nodes.$watch(function () {
      $scope.asJqTreeData = tree.sourceDataAsJqTreeData($scope.nodes);
    });


    $scope.saveA = function(){

      //query.addSort("left", Query.SortDirection.ASCENDING);

      var elementsA = FireRef.child('elementsA');

      //in server B,A,C

      // A,B,C
      var objA = {
        '-JtKa2UVs-ZbBZZfOQ8h':{"properties":{"name":"A","parentId":"","left":1,"right":2}},
        '-JtKa1GCXOe7Jx1ctBnc':{"properties":{"name":"B","parentId":"","left":3,"right":4}},
        '-JtKa37qGVOBZcArg4MS':{"properties":{"name":"C","parentId":"","left":5,"right":6}}
      };

      // B,C,A
      var objB = {
        '-JtKa2UVs-ZbBZZfOQ8h':{"properties":{"name":"A","parentId":"","left":4,"right":5}},
        '-JtKa1GCXOe7Jx1ctBnc':{"properties":{"name":"B","parentId":"","left":1,"right":2}},
        '-JtKa37qGVOBZcArg4MS':{"properties":{"name":"C","parentId":"","left":3,"right":6}}
      };

      elementsA.set(objB);

    };

    $scope.requestA = function(){

      var elementsARef = new Firebase("https://berlin.firebaseio.com/elementsA");
      // download the data from a Firebase database reference into a (pseudo read-only) array

      // create a query for the most recent 25 messages on the server
      var query = elementsARef.orderByChild("left");

      // the $firebaseArray service properly handles Firebase database queries as well
      $scope.logNodes = $firebaseArray(query);

    };

    $scope.saveB = function(){

      //query.addSort("left", Query.SortDirection.ASCENDING);

      var elementsB = FireRef.child('elementsB');

      //in datebase is B,A,C

      // A,B,C
      var objA = {
        '-JtKa2UVs-ZbBZZfOQ8h':{"name":"A","parentId":"","left":1,"right":2},
        '-JtKa1GCXOe7Jx1ctBnc':{"name":"B","parentId":"","left":3,"right":4},
        '-JtKa37qGVOBZcArg4MS':{"name":"C","parentId":"","left":5,"right":6}
      };

      // B,C,A
      var objB = {
        '-JtKa2UVs-ZbBZZfOQ8h':{"name":"A","parentId":"","left":4,"right":5},
        '-JtKa1GCXOe7Jx1ctBnc':{"name":"B","parentId":"","left":1,"right":2},
        '-JtKa37qGVOBZcArg4MS':{"name":"C","parentId":"","left":3,"right":6}
      };

      elementsB.set(objB);

    };

    $scope.requestB = function(){

      var elementsBRef = new Firebase("https://berlin.firebaseio.com/elementsB");
      // download the data from a Firebase database reference into a (pseudo read-only) array

      // create a query for the most recent 25 messages on the server
      var query = elementsBRef.orderByChild("left");

      // the $firebaseArray service properly handles Firebase database queries as well
      $scope.logNodes = $firebaseArray(query);

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

        var node = {
            "left":     left,
            "right":    right,
            "parentId": '',
            "name":     $scope.model.node
        };

        $scope.httpRequestPromise = $scope.nodes.$add(node).then(function() {
          notificationService.success('Data has been saved to our Firebase database');
          $scope.reset();
        },function(error){
          notificationService.error(error);
          //$window.location = '/';
        });

      }
    };


  }]);
