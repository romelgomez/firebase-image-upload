angular.module('tree',['ngMessages','cgBusy','jlareau.pnotify'])
  .factory('treeService', ['$filter',function($filter) {

    return {
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
      pathNames : function(path){
        var pathNames = [];
        angular.forEach(path,function(pathNode){
          pathNames.push(pathNode.name);
        });
        return pathNames;
      }
    };

  }])
  .controller('TreeController',['$scope','$location','user',function($scope, $location, user){

    /*
    * /categories
    * /locations
    * /j-tree-test
    * */

    if(user.uid !== 'facebook:10204911533563856'){
      $location.path('/');
    }

  }])
  .controller('EditNodeController',['$scope', '$q', '$modalInstance', 'node', 'nodeRef',function($scope, $q, $modalInstance, node, nodeRef){

    function updateNode(node){
      var deferred = $q.defer();
      var promise = deferred.promise;
      nodeRef.update({
        name: node.name
      },function(error){
        if(error){
          deferred.reject(error);
        }else{
          deferred.resolve();
        }
      });
      return promise
    }

    $scope.model = {
      name: node.name,
      id: node.id
    };

    $scope.confirm  = function () {
      if($scope.editNodeForm.$valid){

        $scope.httpRequestPromise = updateNode($scope.model)
          .then(function(){
            $modalInstance.close();
          },function(error){
            $modalInstance.dismiss(error);
          });

      }
    };

    $scope.cancel   = function () {
      $modalInstance.dismiss('The editing is been canceled');
    };

  }])
  .controller('DeleteNodeController',['$scope','$modalInstance','node',function($scope,$modalInstance,node){

    $scope.node           = node;
    $scope.branchCheckBox = (($scope.node.left+1) !== ($scope.node.right));
    $scope.model = {
      branch: null
    };

    $scope.confirm  = function () {
      $modalInstance.close({node: node, branch: $scope.model.branch});
    };

    $scope.cancel   = function () {
      $modalInstance.dismiss('Delete action has be cancel');
    };

  }])
  .directive('jTree',[ '$q', '$templateCache', '$compile', '$uibModal', 'FireRef', '$firebaseArray', '$firebaseObject', 'notificationService', '$log', function( $q, $templateCache, $compile, $uibModal, FireRef, $firebaseArray, $firebaseObject, notificationService, $log){

    var treeData = {
      rawNodes:[]
    };

    var nodeSelected = {};
    var reference = '';

    //function deleteAllTree(){
    //  var deferred = $q.defer();
    //  function onComplete(error) {
    //    if (error) {
    //      notificationService.error(error);
    //      deferred.reject();
    //    } else {
    //      notificationService.success('The tree or nodes has been deleted');
    //      deferred.resolve();
    //    }
    //  }
    //  FireRef.child(reference).remove(onComplete);
    //  return deferred.promise;
    //}

    function updateAllTree(newTree){
      var deferred = $q.defer();
      var ref = FireRef.child(reference);
      ref.set(newTree, function(error) {
        if (error) {
          deferred.reject(error);
        } else {
          deferred.resolve();
        }
      });
      return deferred.promise;
    }

    /**
     * Recursive Method, Prepare data for FireBase data store. Implemented by deleteCategory(), treeMove();
     * @param {Object} tree
     * @return {Object}
     */
    function prepareDataForFireBase(tree){
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
    }

    /**
     * Recursive Method, Fix .left and .right values of node of tree. Implemented by: deleteCategory(), treeMove();
     * @param {Object} tree
     * @return {Undefined}
     */
    function normalize(tree){
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

    /**
     * Recursive Method, Exclude node delete.
     * @param {Object} tree
     * @param {String} nodeId, id of node
     * @param {Boolean} branch, delete children nodes too
     * @return {Object} .targetTree: tree with deleted node's already excluded; .recordsIdsForDelete: id of records to delete;
     */
    function excludeNode(tree,nodeId,branch){
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
              // Recursive function
              insertChildNode(result.targetTree,newNode);
            }else{
              // Is root node
              // The node is inserted directly
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
    }


    /**
     * Source node is packed as JqTree node. ImplementedBy sourceDataAsJqTreeData();
     * @param {Object} sourceNode
     * @return {Object}
     */
    function packAsJqTreeNode(sourceNode){
      var node = {};
      node.id         = sourceNode.$id;
      node.label      = sourceNode.name;
      node.parentId   = sourceNode.parentId;
      node.left       = parseInt(sourceNode.left);
      node.right      = parseInt(sourceNode.right);
      node.children   = [];
      return node;
    }

    /**
     * Recursive Method; Is like push(), only that this function completely traverses the tree looking for the father to the son or node. implemented by sourceDataAsJqTreeData();
     * @param {Array} targetTree
     * @param {Object} childNode
     * @return {Undefined}
     */
    function insertChildNode(targetTree,childNode){
      angular.forEach(targetTree,function(node){
        if(node.id === childNode.parentId){
          node.children.push(childNode);
        }else{
          if(node.children.length > 0){
            insertChildNode(node.children,childNode);
          }
        }
      });
    }

    /**
     * Recursive Function, Format source data array as JqTree data.
     * @param {Array} sourceData
     * @returns {Array}
     */
    function sourceDataAsJqTreeData(sourceData){
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
    }

    /**
     * Display initially JqTree Data.
     * @param {Element} element, reference of DOM element
     * @param {Object} data
     * @return undefined
     */
    function displayJqTreeData(element,data){
      var options = {
        dragAndDrop: true,
        selectable: true,
        autoEscape: false,
        autoOpen: false,
        data: data
      };

      element.tree(options);
    }

    /**
     * Replace whole Tree. Implemented By: newCategory(), editCategoryName(), deleteCategory(), treeMove()
     * @param {Element} element, reference of DOM element
     * @param {Object} data
     * @return undefined
     */
    function replaceWholeTree(element,data){
      element.tree('loadData', data);
    }

    return {
      restrict:'E',
      template:'<section cg-busy="{promise:httpRequestPromise,message:\'Just a moment\'}">' +
        '<section>' +
          '<div class="panel panel-default">'+
            '<div class="panel-heading">'+
              '<h3 class="panel-title">New node</h3>'+
            '</div>'+
            '<div class="panel-body" >'+
              '<form id="nodeForm" name="nodeForm" novalidate="" ng-submit="nodeFormSettings.submitForm()">'+
                '<div class="form-group">'+
                  '<label>New node</label>'+
                  '<input type="text" name="node" ng-model="nodeFormSettings.model.nodeName" required no-special-chars class="form-control" placeholder="" tabindex="1">'+
                  '<div data-ng-messages="nodeForm.$submitted && nodeForm.node.$error" class="help-block">'+
                    '<div data-ng-message="required">'+
                      '- The <b>node</b> name is required.'+
                    '</div>'+
                    '<div data-ng-message="noSpecialChars">'+
                    '- The <b>node</b> name must not have special characters.'+
                    '</div>'+
                  '</div>'+
                '</div>'+
              '</form>' +
            '</div>'+
            '<div class="panel-footer">'+
              '<button form="nodeForm" class="btn btn-primary" type="submit">Send</button> '+
              '<button class="btn btn-warning" ng-click="nodeFormSettings.resetForm()">Cancel</button>'+
            '</div>'+
          '</div>'+
        '</section>' +
        '<section>' +
          '<div class="panel panel-default">' +
            '<div class="panel-heading">' +
              '<h3 class="panel-title" style="line-height: 30px;">The <b>{{reference | capitalize}}</b> tree data:' +
                '<div class="btn-group pull-right" role="group" aria-label="..." ng-show="nodeSelected.status">' +
                  '<button ng-click="editNode(nodeSelected.node)" type="button" class="btn btn-info">Edit</button>' +
                  '<button ng-click="deleteNode(nodeSelected.node)" type="button" class="btn btn-danger">Delete</button>' +
                '</div>' +
              '</h3>' +
            '</div>' +
            '<div class="panel-body">' +
              '<div ng-show="rawNodes.length === 0">Start add some data.</div>' +
              '<div id="tree"></div>' +
            '<div/>' +
          '<div/>' +
        '</section>' +
        '<section>' +
          '<div class="panel panel-default">' +
            '<div class="panel-heading">' +
              '<h3 class="panel-title" style="line-height: 30px;">The <b>{{reference | capitalize}}</b> tree <b>Raw</b> data: </h3>' +
            '</div>' +
            '<div class="panel-body">' +
              '<div><div class="alert alert-danger" role="alert"> For recovering purposes, after any changes, update the node service at code level, to avoid lost of this critical data.  </div></div>' +
              '<pre>{{rawNodes | json }}</pre>' +
            '<div/>' +
          '<div/>' +
        '</section>' +
      '<section/>',
      scope: {
        reference: '@'
      },
      link:function(scope,element){
        if (typeof scope.reference === 'undefined') {
          throw '>>> The reference attr is undefined >>>';
        }

        reference = scope.reference;

        var treeElement = element.find('#tree');

        /**
         * Displaying initially Data, which is []
         */
        displayJqTreeData(treeElement,[]);

        /**
         * Observing the move event
         */
        treeElement.bind('tree.move',function(event) {
          event.preventDefault();
          event.move_info.do_move(); // jshint ignore:line
          var proposalTree = angular.fromJson(treeElement.tree('toJson'));
          normalize(proposalTree);
          var newTree = prepareDataForFireBase(proposalTree);
          scope.httpRequestPromise = updateAllTree(newTree)
            .then(function(){
              scope.nodeSelected = {};
              notificationService.success('The tree or nodes has been update');
            },function(error){
              notificationService.error(error);
            });
        });

        /**
         * Observing the select event
         */
        treeElement.bind('tree.select',function(event) {
            var result = {
              status:false,
              $node:{}
            };
            if(event.node !== null){
              result.node = event.node;
              result.status = true;
            }
            scope.nodeSelected = result;
            nodeSelected = result;
            scope.$apply();
          }
        );

        scope.editNode = function(node){
          var modalInstance = $uibModal.open({
            template: '' +
            '<div class="modal-header">'+
              '<h3 class="modal-title">Edit node:</h3>'+
            '</div>'+
            '<div class="modal-body" cg-busy="{promise:httpRequestPromise,message:\'Just a moment\'}">'+
              '<h3 class="text-danger" style="margin-top: 0; margin-bottom: 0;">{{node.name | capitalizeFirstChar}}</h3>'+
              '<form id="editNodeForm" name="editNodeForm" novalidate="" ng-submit="confirm()">'+
                '<div class="form-group">'+
                  '<label>Node name</label>'+
                  '<input type="text" name="node" ng-model="model.name" required no-special-chars class="form-control" placeholder="" tabindex="1">'+
                  '<div data-ng-messages="editNodeForm.$submitted && editNodeForm.node.$error" class="help-block">'+
                    '<div data-ng-message="required">'+
                    '- The <b>node</b> name is required.'+
                    '</div>'+
                    '<div data-ng-message="noSpecialChars">'+
                    '- La <b>node</b> name must not have special characters.'+
                    '</div>'+
                  '</div>'+
                '</div>'+
              '</form>'+
            '</div>'+
            '<div class="modal-footer">'+
              '<button class="btn btn-warning" ng-click="cancel()">Cancel</button>'+
              '<button form="editNodeForm" class="btn btn-primary" type="submit">Confirm</button>'+
            '</div>',
            controller: 'EditNodeController',
            resolve: {
              node: function () {
                return node;
              },
              nodeRef: function () {
                return FireRef.child(scope.reference).child(node.id);
              }
            }
          });
          modalInstance.result.then(function(){
            scope.nodeSelected = {};
            notificationService.success('It was updated successfully.');
          }, function (error) {
            notificationService.error(error);
          });
        };

        scope.deleteNode = function(node){
          var modalInstance = $uibModal.open({
            //templateUrl: 'deleteNode.html',
            template: '' +
            '<div class="modal-header">'+
              '<h3 class="modal-title">Do you really want to delete this node?</h3>'+
            '</div>'+
            '<div class="modal-body">'+
              '<h3 class="text-danger" style="margin-top: 0; margin-bottom: 0;">{{node.name | capitalizeFirstChar}}</h3>'+
              '<form id="deleteBranchForm" name="deleteBranchForm" novalidate="" ng-submit="confirm()">'+
                '<div ng-show="branchCheckBox">'+
                  '<div class="checkbox">'+
                    '<label>'+
                      '<input type="checkbox" name="branch" ng-model="model.branch" value="">' +
                      'And daughters nodes to.'+
                    '</label>'+
                  '</div>'+
                '</div>'+
              '</form>'+
            '</div>'+
            '<div class="modal-footer">'+
              '<button class="btn btn-warning" ng-click="cancel()">Cancel</button>'+
              '<button form="deleteBranchForm" class="btn btn-primary" type="submit">Confirm</button>'+
            '</div>',
            controller: 'DeleteNodeController',
            resolve: {
              node: function () {
                return node;
              }
            }
          });
          modalInstance.result.then(function(result){
            scope.nodeSelected = {};
            var newData = excludeNode( sourceDataAsJqTreeData(treeData.rawNodes), result.node.id, result.branch);
            normalize(newData.targetTree);
            var newTree = prepareDataForFireBase(newData.targetTree);
            scope.httpRequestPromise = updateAllTree(newTree)
              .then(function(){
                notificationService.success('The tree or nodes has been update');
              },function(error){
                notificationService.error(error);
              });
          }, function (error) {
            notificationService.error(error);
          });
        };


        scope.nodeFormSettings = {
          model: {
            nodeName: ''
          },
          submitForm:function(){
            if(scope.nodeForm.$valid){

              var nodesLength = treeData.rawNodes.length;
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
                name:     scope.nodeFormSettings.model.nodeName
              };

              scope.httpRequestPromise = treeData.rawNodes.$add(node).then(function() {
                notificationService.success('Data has been saved.');
                scope.nodeFormSettings.resetForm();
              },function(error){
                notificationService.error(error);
              });

            }
          },
          resetForm:function(){
            scope.nodeFormSettings.model = angular.copy(scope.nodeFormSettings.modelCopy);
            scope.nodeForm.$setUntouched();
            scope.nodeForm.$setPristine();
          }
        };

        scope.nodeFormSettings.modelCopy = angular.copy(scope.nodeFormSettings.model);

        /**
         * The real time data front fireBase
         */
        treeData.rawNodes = $firebaseArray(FireRef.child(scope.reference).orderByChild('left'));
        // For recovery purposes
        scope.rawNodes = $firebaseObject(FireRef.child(scope.reference).orderByChild('left'));

        scope.httpRequestPromise = treeData.rawNodes.$loaded(null,function(error){
          notificationService.error(error);
        });

        /**
         * Observing changes in nodes var, which has first [] empty array, after some time is get server data.
         */
        treeData.rawNodes.$watch(function(){
          //scope.rawNodesLength = treeData.rawNodes.length;
          replaceWholeTree(treeElement,sourceDataAsJqTreeData(treeData.rawNodes));
        });

      }
    };

  }]);

