'use strict';

var publicationsModule = angular.module('publications',['uuid','ngMessages','angular-redactor','ngFileUpload'])
  .factory('publicationService',['$q', '$window', 'imagesService',function( $q, $window, imagesService){

    return {
      savePublication: function(publicationModel, publicationsRef, publicationId) {
        var deferred = $q.defer();

        if(angular.isDefined(publicationId) && publicationId !== ''){
          // update record
          var publicationRef = publicationsRef.child(publicationId);

          delete publicationModel.releaseDate;
          delete publicationModel.images;

          publicationRef.update(publicationModel, function (error) {
            if (error) {
              deferred.reject(error);
            } else {
              deferred.resolve({publicationId: publicationId});
            }
          });

        }else{
          // new record
          var newPublicationRef = publicationsRef.push(); // like array element
          publicationModel.releaseDate = $window.Firebase.ServerValue.TIMESTAMP;
          newPublicationRef.set(publicationModel, function (error) {
            if (error) {
              deferred.reject(error);
            } else {
              deferred.resolve({publicationId: newPublicationRef.key()});
            }
          });

        }

        return deferred.promise;
      },
      removePublication : function( publicationsRef, publicationId){
        var deferred                            = $q.defer();
        var tasksToDo                           = {};

        tasksToDo.deleteImages = imagesService.deleteImages(publicationId,null);
        tasksToDo.detelePublication = publicationsRef.child(publicationId).remove(function (error) {
          if (error) {
            deferred.reject(error);
          } else {
            deferred.resolve();
          }
        });

        $q.all(tasksToDo)
          .then(function(){
            deferred.resolve();
          }, function (error) {
            notificationService.error(error);
          });

        return deferred.promise;
      }
    };

  }])

  .controller('PublicationsController',[
    '$scope',
    '$q',
    '$window',
    '$filter',
    '$routeParams',
    '$location',
    '$http',
    'FireRef',
    '$firebaseArray',
    '$firebaseObject',
    'rfc4122',
    'treeService',
    'notificationService',
    'Upload',
    'user',
    '$uibModal',
    'publicationService',
    'imagesService',
    '$log',function($scope, $q, $window, $filter, $routeParams, $location, $http, FireRef, $firebaseArray, $firebaseObject, rfc4122, treeService, notificationService, $upload, user, $uibModal, publicationService, imagesService, $log){

      var deferred = $q.defer();
      var publicationsRef = FireRef.child('publications');
      //var publications  = $firebaseArray(publicationsRef);

      $scope.httpRequestPromise = deferred.promise;

      $scope.publication = {
        $id: '',
        path: [],
        locationPath: [],
        categories: $firebaseArray(FireRef.child('categories').orderByChild('left')),
        locations: $firebaseArray(FireRef.child('locations').orderByChild('left')),
        categorySelected: false,
        inEditMode: false,
        isReady: false,
        model : {
          userID:               user.uid,
          categoryId:           '',
          locationId:           '',
          featuredImageId:      '',
          department:           '',
          title:                '',
          htmlDescription:      '',
          barcode:              '',
          barcodeType:          'CODE128'
        },
        setCategory: function (categoryId) {
          $scope.publication.model.categoryId           = categoryId;
          $scope.publication.path                       = treeService.getPath(categoryId,$scope.publication.categories);
          $scope.publication.model.categories           = pathNames($scope.publication.path);
          $scope.publication.model.department           = ($scope.publication.path[0]) ? $scope.publication.path[0].name : ''; // $filter('camelCase')($scope.publication.path[0].name)
        },
        submit: function(){
          if($scope.publicationForm.$valid){
            var deferred    = $q.defer();

            publicationService.savePublication( $scope.publication.model, publicationsRef, $scope.publication.$id)
              .then(function(the){
                $scope.publication.$id = $scope.publication.$id !== '' ? $scope.publication.$id : the.publicationId;
                return imagesService.saveFiles(publicationsRef, $scope.publication.$id, $scope.publication.images)
              })
              .then(function () {

                notificationService.success('Data has been save');
                deferred.resolve();

              },function(error){

                notificationService.error(error);
                deferred.reject(error);

              });

            $scope.httpRequestPromise = deferred.promise;
          }else{
            notificationService.error('Something is missing');
          }
        }
      };

      var categories = $scope.publication.categories.$loaded();
      var locations = $scope.publication.locations.$loaded();

      $q.all([categories,locations])
        .then(function () {
          if(angular.isDefined($routeParams.publicationId)){
            return setPublication($routeParams.publicationId);
          }else{
            $scope.publication.images = []; // If this definition is moved to the main object the images in edit mode after F5 are not recognized.
          }
        })
        .then(function(){
          $scope.publication.isReady = true;
          deferred.resolve();
        });

      $scope.$watch(function(scope){
        return scope.publication.model.htmlDescription;
      },function(){
        $scope.publication.model.description = $filter('htmlToPlaintext')($scope.publication.model.htmlDescription);
      });

      $scope.$watch(function(scope){
        return scope.publication.model.htmlWarranty;
      },function(){
        $scope.publication.model.warranty = $filter('htmlToPlaintext')($scope.publication.model.htmlWarranty);
      });

      $scope.discard = function(){
        var modalInstance = $uibModal.open({
          templateUrl: 'discardPublication.html',
          controller: 'DiscardPublicationController',
          resolve: {
            publicationId:function(){
              return $scope.publication.$id !== '';
            },
            title: function () {
              return $scope.publication.model.title !== '' && $scope.publication.model.title !== undefined  ? $scope.publication.model.title : 'Untitled';
            }
          }
        });
        modalInstance.result.then(function(){
          if($scope.publication.$id !== ''){
            $scope.httpRequestPromise = publicationService.removePublication(publicationsRef, $scope.publication.$id)
              .then(function(){
                notificationService.success('The publication has been deleted.');
                $location.path('/');
              });
          }else{
            notificationService.success('The publication has been discard.');
            $location.path('/');
          }
        }, function (error) {
          notificationService.error(error);
        });
      };

      function pathNames(path){
        var pathNames = [];
        angular.forEach(path,function(pathNode){
          pathNames.push(pathNode.name);
        });
        return pathNames;
      }

      function loadPublication(publicationId) {
        var deferred   = $q.defer();

        var publicationRef = publicationsRef.child(publicationId);
        var publication = $firebaseObject(publicationRef);

        publication.$loaded(function(){
          if (typeof publication.releaseDate === 'undefined'){
            deferred.reject('404');
          } else if (user.uid !== publication.userID) {
            deferred.reject('401');
          } else {
            deferred.resolve({publication:publication});
          }
        }, function (error) {
          deferred.reject(error);
        });

        return deferred.promise;
      }

      function setPublication(publicationId){
        var deferred   = $q.defer();

        loadPublication(publicationId)
          .then(function (the) {
            angular.forEach(the.publication, function ( value, key) {
              if(key !== 'releaseDate'){
                $scope.publication.model[key] = value;
              }
            });
          })
          .then(function(){
            $scope.publication.images = [];
            angular.forEach($scope.publication.model.images, function(value, key){
              value.$id = key;
              $scope.publication.images.push(value);
            })
          })
          .then(function(){
            $scope.publication.$id              = publicationId;

            $scope.publication.path             = treeService.getPath($scope.publication.model.categoryId,$scope.publication.categories);
            if($scope.publication.path.length > 0){
              $scope.publication.categorySelected = true;
            }else{
              // This mean that for some reason the categories database it got lost completely or partially temporarily, and with this, we force the user redefine category.
              $scope.publication.redefineCategory = true;
              $scope.publication.categorySelected = false;
              $scope.publication.model.categoryId = '';
            }

            $scope.publication.locationPath     = treeService.getPath($scope.publication.model.locationId,$scope.publication.locations);
            if($scope.publication.locationPath.length === 0){
              // This mean that for some reason the location database it got lost completely or partially temporarily, and with this, we force the user redefine the location.
              $scope.publication.redefineLocation = true;
              $scope.publication.model.locationId = '';
            }

            $scope.publication.inEditMode       = true;
            deferred.resolve();
          },function(error){
            $location.path('/');
            deferred.reject(error);
          });

        return deferred.promise;
      }

    }])
  .controller('DiscardPublicationController',['$scope', '$modalInstance', 'publicationId', 'title',function($scope, $modalInstance, publicationId, title){

    $scope.publication = {
      $id: publicationId,
      title: title
    };

    $scope.confirm  = function () {
      $modalInstance.close();
    };

    $scope.cancel   = function () {
      $modalInstance.dismiss('This has be cancel');
    };

  }])
  .directive('locationInput',['treeService',function(treeService){

    return {
      scope:{
        formName:'=',
        locations:'=',
        model:'=',
        redefineLocation:'=',
        locationPath:'='
      },
      template:'' +
      '<div>'+
        '<hr class="hr-xs">'+
        '<label class="control-label"><i class="fa fa-map-marker"></i> Location <sup style="color: red;">*</sup></label>'+
        '<div class="list-group" style="margin-bottom: 0">'+
          '<button type="button" class="list-group-item" ng-click="setLocation(location.$id); publication.redefineLocation = false;" ng-repeat="location in locations | filter:{parentId: model.locationId}:true" ><i style="color: #286090" class="fa fa-folder"></i> {{location.name | capitalizeFirstChar}}</button>'+
        '</div>'+

        '<ol ng-show="locationPath.length > 0" class="breadcrumb" style="margin-bottom: 0; margin-top: 10px;">'+
          '<li ng-click="model.locationId =\'\'; locationPath =[];" class="a-link"> Reset </li>'+
          '<li ng-repeat="location in locationPath" ng-click="setLocation(location.$id)" ng-class="{\'a-link\': !$last}"> {{location.name | capitalizeFirstChar}} </li>'+
        '</ol>'+

        '<input name="location" ng-model="model.locationId" required class="form-control" placeholder="" type="text" style="display: none;">'+
        '<div data-ng-messages="publicationForm.$submitted && publicationForm.location.$error" class="help-block">'+
          '<div data-ng-message="required" >'+
          '- The <b>Location</b> is required.'+
          '</div>'+
        '</div>'+

        '<div ng-show="formName.redefineLocation === true" class="alert alert-danger alert-xs" style="margin-bottom: 10px;" role="alert"><b>NOTE: Sorry, but we need to redefine the location.</b></div>'+
        '<div class="alert alert-info alert-xs" style="margin-bottom: 0; margin-top: 10px;" role="alert">NOTE: Select the <b>location</b> that best suits to the publication. No matter if it is too general or specific, the important thing is to select one.</div>'+
      '</div>',
      link:function(scope){

        scope.setLocation = function (locationId) {
          scope.model.locationId          = locationId;
          scope.locationPath              = treeService.getPath(locationId,scope.locations);
          scope.model.locations           = treeService.pathNames(scope.locationPath);
        }

      }
    }


  }])
  .directive('categorySelector',['treeService', function (treeService) {

    return {
      restrict:'E',
      scope:{
        path:'=',
        categorySelected:'=',
        isReady:'=',
        inEditMode:'=',
        model:'=',
        categories:'=',
        redefineCategory:'='
      },
      template:'' +
      '<div class="panel panel-default" ng-show="categorySelected === false && isReady">'+
        '<div class="panel-heading">'+
          '<h3 class="panel-title" ng-switch="inEditMode">'+
            '<span ng-switch-when="false" >New Publication - Select a category:</span>'+
            '<span ng-switch-when="true">Edit Publication</span>'+
          '</h3>'+
        '</div>'+
        '<div class="list-group">'+
          '<button type="button" class="list-group-item" ng-click="setCategory(category.$id)" ng-repeat="category in categories | filter:{parentId: model.categoryId}:true" >' +
            '<i style="color: #286090" class="fa" ng-class="{\'fa-folder\': (category.name !== \'Marketplace\' && category.name !== \'Jobs\' && category.name !== \'Real Estate\' && category.name !== \'Transport\' && category.name !== \'Services\') , \'fa-shopping-cart\': (category.name === \'Marketplace\') , \'fa-suitcase\': (category.name === \'Jobs\'), \'fa-home\': (category.name === \'Real Estate\'), \'fa-car\': (category.name === \'Transport\'), \'fa-wrench\' : (category.name === \'Services\')}"></i> '+
            '{{category.name | capitalizeFirstChar}}'+
          '</button>'+
        '</div>'+
        '<div class="panel-body">'+
          '<ol ng-show="path.length > 0" class="breadcrumb" style="margin-bottom: 7px;">'+
            '<li ng-click="model.categoryId = \'\'; path =[];" class="a-link"> Reset </li>'+
            '<li ng-repeat="category in path" ng-click="setCategory(category.$id)" ng-class="{\'a-link\': !$last}"> {{category.name | capitalizeFirstChar}} </li>'+
          '</ol>'+
          '<div ng-show="redefineCategory === true" class="alert alert-danger alert-xs" style="margin-bottom: 10px;" role="alert"><b>NOTE: Sorry, but we need to redefine the category.</b></div>'+
          '<div class="alert alert-info alert-xs" style="margin-bottom: 0;" role="alert">NOTE: Select the category that best suits to the publication. No matter if it is too general or specific, the important thing is to select one.</div>'+
        '</div>'+
        '<div class="panel-footer" style="text-align: right;">'+
          '<button ng-click="categorySelected = true; redefineCategory = false" type="button" class="btn btn-primary" ng-disabled="model.categoryId ===\'\'" >'+
            '<i class="fa fa-check"></i> Confirm selection' +
          '</button>'+
        '</div>'+
      '</div>',
      link:function(scope){

        scope.setCategory = function (categoryId) {
          scope.model.categoryId           = categoryId;
          scope.path                       = treeService.getPath(categoryId,scope.categories);
          scope.model.categories           = treeService.pathNames(scope.path);
          scope.model.department           = (scope.path[0]) ? scope.path[0].name : ''; // $filter('camelCase')($scope.publication.path[0].name)
        };

      }

    }


  }]);
