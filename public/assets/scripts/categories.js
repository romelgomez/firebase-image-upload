'use strict';

// TODO SIMPLIFY, DELETE DUPLICATE CODE

angular.module('categories',['ngMessages','cgBusy','jlareau.pnotify'])
  .factory('categoriesService',['$q','$filter','$firebaseArray','FireRef','notificationService',function($q,$filter,$firebaseArray,FireRef,notificationService){

    /**
     * Source node is packed as JqTree node. ImplementedBy sourceDataAsJqTreeData();
     * @param {Object} sourceNode
     * @return {Object}
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
     * Recursive Method; Is like push(), only that this function completely traverses the tree looking for the father to the son or node. implemented by sourceDataAsJqTreeData();
     * @param {Array} targetTree
     * @param {Object} childNode
     * @return {Undefined}
     */
    var insertChildNode = function(targetTree,childNode){
      angular.forEach(targetTree,function(node){
        if(node.id === childNode.parentId){
          node.children.push(childNode);
        }else{
          if(node.children.length > 0){
            insertChildNode(node.children,childNode);
          }
        }
      });
    };

    var currentReference = '';

    return {
      nodes:function(reference){
        currentReference = currentReference !== '' ?  currentReference : reference;
        var ref = FireRef.child(currentReference);
        return $firebaseArray(ref.orderByChild('left'));
      },
      updateAllTree:function(newTree){
        var deferred = $q.defer();
        var promise = deferred.promise;
        var ref = FireRef.child(currentReference);
        ref.set(newTree, function(error) {
          if (error) {
            notificationService.error(error);
            deferred.reject();
          } else {
            notificationService.success('The tree or nodes has been update');
            deferred.resolve();
          }
        });
        return promise;
      },
      deleteAllTree: function(){
        var deferred = $q.defer();
        var promise = deferred.promise;
        var onComplete = function(error) {
          if (error) {
            notificationService.error(error);
            deferred.reject();
          } else {
            notificationService.success('The tree or nodes has been deleted');
            deferred.resolve();
          }
        };
        FireRef.child(currentReference).remove(onComplete);
        return promise;
      },
      /**
       * Recursive Function, Format source data array as JqTree data.
       * @param {Array} sourceData
       * @returns {Array}
       */
      sourceDataAsJqTreeData: function(sourceData){
        var targetTree = [];
        angular.forEach(sourceData, function(obj){
          var node  = packAsJqTreeNode(obj);
          if(node.parentId !== ''){
            // Is child node
            insertChildNode(targetTree,node);
          }else{
            // Is root node
            targetTree.push(node);
          }
        });
        return targetTree;
      },
      /**
       * Recursive Method, Prepare data for FireBase data store. Implemented by deleteCategory(), treeMove();
       * @param {Object} tree
       * @return {Object}
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
       * Recursive Method, Fix .left and .right values of node of tree. Implemented by: deleteCategory(), treeMove();
       * @param {Object} tree
       * @return {Undefined}
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
      },
      /**
       * Recursive Method, Exclude node delete.
       * @param {Object} tree
       * @param {String} nodeId, id of node
       * @param {Boolean} branch, delete children nodes too
       * @return {Object} .targetTree: tree with deleted node's already excluded; .recordsIdsForDelete: id of records to delete;
       */
      excludeNode : function(tree,nodeId,branch){
        var result = {
          targetTree: [],
          recordsIdsForDelete:[]
        };
        var getRecordsIdsForDelete = function(deleteNode){
          var result = [];
          result.push(deleteNode.id);
          var process = function(node){
            angular.forEach(node, function (currentNode) {
              result.push(currentNode.id);
              if(currentNode.children.length > 0){
                process(currentNode.children);
              }
            });
          };
          process(deleteNode.children);
          return result;
        };
        var process = function(tree){
          angular.forEach(tree, function (node) {
            if(node.id === nodeId){
              if(node.children.length > 0){
                if(branch === true){
                  // delete node and children
                  result.recordsIdsForDelete = getRecordsIdsForDelete(node);
                }else{
                  // Keep children
                  result.recordsIdsForDelete.push(node.id);
                  if(node.parentId === ''){
                    for(var i = 0; i < node.children.length; i++){
                      node.children[i].parentId = '';
                    }
                  }else{
                    for(var e = 0; e < node.children.length; e++){
                      node.children[e].parentId = node.parentId;
                    }
                  }
                  process(node.children);
                }
              }else{
                result.recordsIdsForDelete.push(node.id);
              }
            }else{
              var newNode = {
                id:             node.id,
                parentId:       node.parentId,
                name:           node.label,
                left:           node.left,
                right:          node.right,
                children:       []
              };
              if(node.parentId !== ''){
                // Is child node
                // Función recursiva
                insertChildNode(result.targetTree,newNode);
              }else{
                // Is root node
                // Se inserta el nodo directamente
                result.targetTree.push(newNode);
              }
              if(node.children !== undefined){
                process(node.children);
              }
            }
          });
        };
        process(tree);
        return result;
      },
      getPath : function(nodeId,nodes){
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
      },
      nodeSelected: {},
      updateNode:function(node){
        var deferred = $q.defer();
        var promise = deferred.promise;
        var nodeRef = FireRef.child(currentReference).child(node.id);
        nodeRef.update({
          name:node.name
        },function(error){
          if(error){
            deferred.reject(error);
          }else{
            deferred.resolve();
          }
        });
        return promise
      }
    };

  }])
  .controller('TreeController',['$scope','notificationService','categoriesService','$uibModal',function($scope,notificationService,categoriesService,$uibModal){

    $scope.testData = 'categories string';

    $scope.nodes = categoriesService.nodes('categories');

    $scope.asJqTreeData = [];

    $scope.nodes.$watch(function () {
      $scope.asJqTreeData = categoriesService.sourceDataAsJqTreeData($scope.nodes);
    });

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
      $scope.httpRequestPromise = categoriesService.deleteAllTree();
    };

    $scope.deleteNode = function(node){
      var modalInstance = $uibModal.open({
        templateUrl: 'deleteNode.html',
        controller: 'DeleteNodeController',
        resolve: {
          node: function () {
            return node;
          }
        }
      });
      modalInstance.result.then(function(branch){
        var newData = categoriesService.excludeNode($scope.asJqTreeData,node.$id,branch);
        categoriesService.normalize(newData.targetTree);
        var newTree = categoriesService.prepareDataForFireBase(newData.targetTree);
        $scope.httpRequestPromise = categoriesService.updateAllTree(newTree);
      }, function (error) {
        notificationService.error(error);
      });
    };

    $scope.editNode = function(node){
      var modalInstance = $uibModal.open({
        templateUrl: 'editNode.html',
        controller: 'EditNodeController',
        resolve: {
          node: function () {
            return node;
          }
        }
      });
      modalInstance.result.then(function(){
        notificationService.success('It was updated successfully.');
      }, function (error) {
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
          left:     left,
          right:    right,
          parentId: '',
          name:     $scope.model.node
        };

        $scope.httpRequestPromise = $scope.nodes.$add(node).then(function() {
          notificationService.success('Data has been saved to our FireBase database');
          $scope.reset();
        },function(error){
          notificationService.error(error);
          //$window.location = '/';
        });

      }
    };

    $scope.updateAllTree = function (newTree){
      $scope.httpRequestPromise = categoriesService.updateAllTree(newTree);
    };

    $scope.nodeSelected = categoriesService.nodeSelected;

    $scope.$watch(function () {
      return categoriesService.nodeSelected;
    },function () {
      $scope.nodeSelected = categoriesService.nodeSelected;
    });

  }])
  .controller('LocationsController',['$scope','notificationService','categoriesService','$uibModal',function($scope,notificationService,categoriesService,$uibModal){

    $scope.testData = 'location string';

    $scope.nodes = categoriesService.nodes('locations');

    $scope.asJqTreeData = [];

    $scope.nodes.$watch(function () {
      $scope.asJqTreeData = categoriesService.sourceDataAsJqTreeData($scope.nodes);
    });

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
      $scope.httpRequestPromise = categoriesService.deleteAllTree();
    };

    $scope.deleteNode = function(node){
      var modalInstance = $uibModal.open({
        templateUrl: 'deleteNode.html',
        controller: 'DeleteNodeController',
        resolve: {
          node: function () {
            return node;
          }
        }
      });
      modalInstance.result.then(function(branch){
        var newData = categoriesService.excludeNode($scope.asJqTreeData,node.$id,branch);
        categoriesService.normalize(newData.targetTree);
        var newTree = categoriesService.prepareDataForFireBase(newData.targetTree);
        $scope.httpRequestPromise = categoriesService.updateAllTree(newTree);
      }, function (error) {
        notificationService.error(error);
      });
    };

    $scope.editNode = function(node){
      var modalInstance = $uibModal.open({
        templateUrl: 'editNode.html',
        controller: 'EditNodeController',
        resolve: {
          node: function () {
            return node;
          }
        }
      });
      modalInstance.result.then(function(){
        notificationService.success('It was updated successfully.');
      }, function (error) {
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
          left:     left,
          right:    right,
          parentId: '',
          name:     $scope.model.node
        };

        $scope.httpRequestPromise = $scope.nodes.$add(node).then(function() {
          notificationService.success('Data has been saved to our FireBase database');
          $scope.reset();
        },function(error){
          notificationService.error(error);
          //$window.location = '/';
        });

      }
    };

    $scope.updateAllTree = function (newTree){
      $scope.httpRequestPromise = categoriesService.updateAllTree(newTree);
    };

    $scope.nodeSelected = categoriesService.nodeSelected;

    $scope.$watch(function () {
      return categoriesService.nodeSelected;
    },function () {
      $scope.nodeSelected = categoriesService.nodeSelected;
    });

  }])
  .controller('DeleteNodeController',['$scope','$modalInstance','node',function($scope,$modalInstance,node){

    $scope.node           = node;
    $scope.branchCheckBox = (($scope.node.left+1) !== ($scope.node.right));
    $scope.model = {
      branch: null
    };

    $scope.confirm  = function () {
      $modalInstance.close($scope.model.branch);
    };

    $scope.cancel   = function () {
      $modalInstance.dismiss('this has be cancel');
    };

  }])
  .controller('EditNodeController',['$scope','$modalInstance','node','categoriesService',function($scope,$modalInstance,node,categoriesService){

    $scope.model = {
      name: node.name,
      id: node.id
    };

    $scope.confirm  = function () {
      if($scope.editNodeForm.$valid){
        $scope.httpRequestPromise = categoriesService.updateNode($scope.model)
          .then(function(){
            categoriesService.nodeSelected = {};
            $modalInstance.close();
          },function(error){
            $modalInstance.dismiss(error);
          });
      }
    };

    $scope.cancel   = function () {
      $modalInstance.dismiss('this has be cancel');
    };

  }])
  .directive('tree',['$templateCache','$compile','categoriesService',function($templateCache,$compile,categoriesService){

    return {
      restrict:'E',
      replace:true,
      template:'<div><div/>',
      scope: {
        reference: '@'
      },
      link:function(scope,element){
        if (typeof scope.reference === "undefined") {
          throw "the reference attr is undefined";
        }

        /**
         * Display initially JqTree Data.
         * @param {Element} element, reference of DOM element
         * @param {Object} data
         * @return undefined
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
         * Replace whole Tree. Implemented By: newCategory(), editCategoryName(), deleteCategory(), treeMove()
         * @param {Element} element, reference of DOM element
         * @param {Object} data
         * @return undefined
         */
        var replaceWholeTree = function(element,data){
          element.tree('loadData', data);
        };


        /**
         * Displaying initially Data, which is []
         */
        displayJqTreeData(element,[]);

        /**
         * Observing the move event
         */
        element.bind('tree.move',function(event) {
          event.preventDefault();
          event.move_info.do_move(); // jshint ignore:line
          var proposalTree = angular.fromJson(element.tree('toJson'));
          categoriesService.normalize(proposalTree);
          var newTree = categoriesService.prepareDataForFireBase(proposalTree);
          scope.updateAllTree(newTree);
        });

        /**
         * Observing the select event
         */
        element.bind('tree.select',function(event) {
            var result = {
              status:false,
              node:{}
            };
            if(event.node !== null){
              result.node = event.node;
              result.status = true;
            }
            categoriesService.nodeSelected = result;
            scope.$apply();
          }
        );

        /**
         * The real time data front fireBase
         */
        var nodes = categoriesService.nodes(scope.reference);

        /**
         * Observing changes in nodes var, which has first [] empty array, after some time is get server data.
         */
        nodes.$watch(function(){
          replaceWholeTree(element,categoriesService.sourceDataAsJqTreeData(nodes));
        });

      }
    };

  }]);
