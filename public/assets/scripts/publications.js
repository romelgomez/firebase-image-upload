'use strict';

var publicationsModule = angular.module('publications',['uuid','ngMessages','angular-redactor','ngFileUpload'])
  .factory('publicationService',['$q', '$window', 'imagesService',function( $q, $window, imagesService){

    return {
      savePublication: function(publicationModel, publicationsRef, publicationId) {
        var deferred = $q.defer();

        if(angular.isDefined(publicationId) && publicationId !== ''){
          // update record
          var publicationRef = publicationsRef.child(publicationId);

          var record = {};
          angular.forEach(publicationModel,function(value,key){
            if(key !== 'releaseDate'){
              record[key] = value;
            }
          });

          publicationRef.update(record, function (error) {
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
        setLocation: function (locationId) {
          $scope.publication.model.locationId          = locationId;
          $scope.publication.locationPath              = treeService.getPath(locationId,$scope.publication.locations);
          $scope.publication.model.locations           = pathNames($scope.publication.locationPath);
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

  }]);
