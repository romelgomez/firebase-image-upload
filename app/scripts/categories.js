'use strict';

angular.module('categories',['ngMessages','cgBusy','jlareau.pnotify'])
  .directive('treeOld',['$templateCache','$compile','$log',function($templateCache,$compile,$log){


    return {
      restrict:'E',
      scope: {
        'nodes':'@',
        'jqTreeData':[]
      },
      remplace:true,
      template:'<b>Hi</b>',
      controller:controller,
      link:function(scope,element){

        //if(typeof scope.nodes ===  'undefined'){
        //  throw { message: 'attrs nodes is not defined' };
        //}

        //$log.log(scope.nodes);

        //scope.$watch('nodes', function(){
        //
        //  var template = '';
        //  if(scope.nodes.length > 0){
        //    template = 'tree.html';
        //  }else{
        //    template = 'noTree.html';
        //  }
        //
        //  scope.jqTreeData = scope.sourceDataAsJqTreeData(scope.nodes);
        //
        //  element.html($compile($templateCache.get(template))(scope));
        //});

      }
    };
  }])
  .directive('tree',['$templateCache','$compile','$log',function($templateCache,$compile,$log){

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
      scope: {
        nodes: '='
      },
      replace:true,
      controller:controller,
      //template:'<pre>{{ nodes | json }}<pre/>',
      link:function(scope,element){

        if(typeof scope.nodes ===  'undefined'){
          throw { message: 'attrs nodes is not defined' };
        }

        //$log.log(scope.nodes);
        //$log.log(scope.jqTreeData);

        scope.$watch('nodes', function(){

          $log.log('this is scope.nodes: ',scope.nodes);

          var template = '';
          if(scope.nodes.length > 0){
            template = 'tree.html';
          }else{
            template = 'noTree.html';
          }

          scope.jqTreeData = scope.sourceDataAsJqTreeData(scope.nodes);
          $log.log(scope.jqTreeData);

          element.html($compile($templateCache.get(template))(scope));
        });


      }
    };

  }])
  .controller('CategoriesController',['$scope','$firebaseArray','FireRef','notificationService','$window','$log',function($scope,$firebaseArray,FireRef,notificationService,$window,$log){

    var mockObj = [
      {
        properties:{
          name:'Category 0',left:'1',right:'2',parentId:''
        },
        $id:'0',
        $priority:null
      },
      {
        properties:{
          name:'Category 0',left:'3',right:'4',parentId:''
        },
        $id:'1',
        $priority:null
      },
      {
        properties:{
          name:'Category 0',left:'5',right:'6',parentId:''
        },
        $id:'2',
        $priority:null
      },
      {
        properties:{
          name:'Category 0',left:'7',right:'12',parentId:''
        },
        $id:'3',
        $priority:null
      },
      {
        properties:{
          name:'Category 0',left:'8',right:'9',parentId:'3'
        },
        $id:'4',
        $priority:null
      },
      {
        properties:{
          name:'Category 0',left:'10',right:'11',parentId:'3'
        },
        $id:'5',
        $priority:null
      },
      {
        properties:{
          name:'Category 0',left:'13',right:'14',parentId:''
        },
        $id:'6',
        $priority:null
      }
    ];

    //mockObj = [];


    //var categoriesRef  = FireRef.child('categories');
    //$scope.categories = $firebaseArray(categoriesRef);
    $scope.categories = mockObj;


    $scope.logThis = function(){
      angular.forEach($scope.categories, function(value){
        $log.log(value);
      });
    };

    //$scope.httpRequestPromise = $scope.categories.$loaded()
    //  .then(null,function(error){
    //    notificationService.error(error);
    //  });

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
