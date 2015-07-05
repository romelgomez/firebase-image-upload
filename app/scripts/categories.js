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
          node.left       = parseInt(sourceNode.properties.left);
          node.right      = parseInt(sourceNode.properties.right);
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
         @Description Recursive Function, Format source data array as JqTree data.
         @parameters  {sourceData: Array}
         @returns     Array
         */
        var sourceDataAsJqTreeData = function(sourceData){
          var targetTree = [];
          angular.forEach(sourceData, function(obj){
            var node  = packAsJqTreeNode(obj);
            if(node.parentId != ''){
              // Is child node
              insertChildNode(targetTree,node);
            }else{
              // Is root node
              targetTree.push(node);
            }
          });
          return targetTree;
        };

        /**
         @Name              prepareDataForFireBase
         @Descripción       Recursive Method, Prepare data for FireBase data store.
         @parameters        {tree: object}
         @returns           object
         @implementedBy    deleteCategory(), treeMove();
         */
        var prepareDataForFireBase = function(tree){
          var nodes = {};
          var process = function(tree){
            angular.forEach(tree,function(node){
              nodes[node.id]                      = {};
              nodes[node.id].properties           = {};
              nodes[node.id].properties.name      = node.name;
              nodes[node.id].properties.parentId  = node.parentId;
              nodes[node.id].properties.left      = node.left;
              nodes[node.id].properties.right     = node.right;
              if(node.children.length > 0){
                process(node.children);
              }
            });
          };
          process(tree);
          return nodes;
        };

        /**
         @Name            normalize
         @Descripción     Recursive Method, Fix .left and .right values of node of tree.
         @parameters      {tree:object}
         @returns         Null
         @implementedBy   deleteCategory(), treeMove();
         */
        var normalize = function(tree){
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

          normalize(proposalTree);

          var newTree = prepareDataForFireBase(proposalTree);

           //$log.log('newTree: ',angular.toJson(newTree));

          var ref = tree.ref();
          ref.set(newTree);


          //var proposalTree = angular.fromJson(element.tree('toJson'));
          //
          //$log.log('no normalized',proposalTree);
          //
          //normalize(proposalTree);
          //
          //$log.log('normalized',proposalTree);

          //var tree = JSON.parse(treeElement.tree('toJson'));
          //
          //normalize(tree);
          //
          //var new_tree = prepare_for_data_store(tree);
          //
          //request_parameters['data'] = {
          //  'tree':new_tree
          //};
          //
          //ajax.request(request_parameters);
          //

        });

        /**
         @Descripción   Observing the select event
         */
        element.bind('tree.select',function(event) {

            $log.log('event.node',event.node);

            $log.log(element.tree('toJson'));

            var proposalTree = angular.fromJson(element.tree('toJson'));

            $log.log('no normalized',proposalTree);

            var proposalTree2 = JSON.parse(element.tree('toJson'));

            $log.log('no normalized 2 ',proposalTree2);

            //var adminCategory = $("#admin-category");

            //if (event.node) {
            //
            //  //  EDIT
            //  $("#edit-category-id").val(event['node']['id']);
            //  $("#edit-category-name").val(event['node']['name']);
            //
            //  //  Delete
            //  $("#delete-category-id").val(event['node']['id']);
            //  $("#delete-category-name").text(event['node']['name']);
            //
            //  if(event['node']['children'].length > 0){
            //    $("#delete-category-branch").parents(".form-group").show();
            //  }else{
            //    $("#delete-category-branch").parents(".form-group").hide();
            //  }
            //
            //  // Habilita los botones.
            //  adminCategory.find("button").each(function(k,element){
            //    $(element).removeClass("disabled");
            //  });
            //}else {
            //  // inhabilita los botones.
            //  adminCategory.find("button").each(function(k,element){
            //    $(element).addClass("disabled");
            //  });
            //}

          }
        );


        /**
         @Descripción   Observing changes in nodes var, which has first [] empty array, after some time is get server data.
         */
        nodes.$watch(function(){

          replaceWholeTree(element,sourceDataAsJqTreeData(nodes));

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
  .controller('TreeController',['$scope','notificationService','$window','tree','$log','FireRef',function($scope,notificationService,$window,tree,$log,FireRef){

    $scope.nodes = tree.nodes();

    $scope.logThis = function(){

      var users = FireRef.child('users');

      var obj = {
        'name':'romel',
        'lastName':'Gomez'
      };

      var obj3 = {
        0:{"$id":"-JtKa2UVs-ZbBZZfOQ8h","properties":{"name":"nex","parentId":"","left":1,"right":4}},
        1:{"$id":"-JtKa1GCXOe7Jx1ctBnc","properties":{"name":"hi","parentId":"-JtKa2UVs-ZbBZZfOQ8h","left":2,"right":3}},
        2:{"$id":"-JtKa37qGVOBZcArg4MS","properties":{"name":"ok","parentId":"","left":5,"right":6}},
        3:{"$id":"-JtKarCcedt-dQwvJb02","properties":{"name":"1132","parentId":"","left":7,"right":8}},
        4:{"$id":"-JtM5tEXUMv-p5d_nIlP","properties":{"name":"ok","parentId":"","left":9,"right":10}}
      };

      var obj4 = {
        '-JtKa2UVs-ZbBZZfOQ8h':{"properties":{"name":"nex","parentId":"","left":1,"right":4}},
        '-JtKa1GCXOe7Jx1ctBnc':{"properties":{"name":"hi","parentId":"-JtKa2UVs-ZbBZZfOQ8h","left":2,"right":3}},
        '-JtKa37qGVOBZcArg4MS':{"properties":{"name":"ok","parentId":"","left":5,"right":6}},
        '-JtKarCcedt-dQwvJb02':{"properties":{"name":"1132","parentId":"","left":7,"right":8}},
        '-JtM5tEXUMv-p5d_nIlP':{"properties":{"name":"ok","parentId":"","left":9,"right":10}}
      };


      users.set(obj4);


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
