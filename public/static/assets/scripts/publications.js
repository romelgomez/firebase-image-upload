'use strict';

var publicationsModule = angular.module('publications',['uuid','ngMessages','angular-redactor','ngFileUpload','cloudinary','algoliasearch', 'images'])
  .factory('treeService', [
    '$filter',
    function($filter) {

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
  .factory('publicationService',['$q', '$window', 'FireRef', 'imagesService', function( $q, $window, FireRef, imagesService){

    var publicationsRef = FireRef.child('publications');


    function updateCount( userID, newOne){
      var deferred = $q.defer();

      var publicationsCountRef = FireRef.child('users').child(userID).child('publicationsCount');

      publicationsCountRef.once('value',function(snapshot){
        var count;
        if(snapshot.exists()){
          count = snapshot.val();
        }else{
          count = 0;
        }

        if(typeof newOne !== 'undefined' && newOne === true){
          count += 1;
        } else {
          count -= 1;
        }

        publicationsCountRef.set(count)
          .then(function(){
            deferred.resolve();
          },function(error){
            deferred.reject(error);
          });

      });

      return deferred.promise;
    }


    return {
      savePublication: function(publicationModel, publicationId, userID) {
        var deferred                            = $q.defer();

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
          publicationModel.releaseDate = $window.firebase.database.ServerValue.TIMESTAMP;
          newPublicationRef.set(publicationModel)
            .then(function(){
              return updateCount(userID, true);
            })
            .then(function(){
              deferred.resolve({publicationId: newPublicationRef.key});
            },function(error){
              deferred.reject(error);
            });
        }

        return deferred.promise;
      },
      removePublication : function( publicationId, userID){
        var deferred                            = $q.defer();
        var promises                            = [];

        promises.push(imagesService.deleteImages(publicationId,null));
        promises.push(publicationsRef.child(publicationId).remove());
        promises.push(updateCount(userID));

        $q.all(promises)
          .then(function(){
            deferred.resolve();
          }, function (error) {
            notificationService.error(error);
          });

        return deferred.promise;
      },
      saveFilesData : function( publicationID, files) {
        var deferred                            = $q.defer();

        var publicationImagesRef = publicationsRef.child(publicationID).child('images');
        var saveFilesData = [];

        angular.forEach(files,function(fileData, fileID){
          saveFilesData.push(publicationImagesRef.child(fileID).set(fileData));
        });

        $q.all(saveFilesData)
          .then(function(){
            deferred.resolve();
          });

        return deferred.promise;
      },
      loadPublication : function (userID, publicationID) {
        var deferred   = $q.defer();

        publicationsRef.child(publicationID).once('value',function(snapshot){
          var publication = snapshot.val();
          if(snapshot.exists()){
            if(userID === publication.userID){
              deferred.resolve({publication:publication});
            }else{
              deferred.reject('401');
            }
          } else {
            deferred.reject('404');
          }

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
    'CATEGORIES',
    'LOCATIONS',
    function($scope, $q, $window, $filter, $routeParams, $location, $http, FireRef, $firebaseArray, $firebaseObject, rfc4122, treeService, notificationService, $upload, user, $uibModal, publicationService, imagesService, CATEGORIES, LOCATIONS){

      var deferred = $q.defer();
      $scope.httpRequestPromise = deferred.promise;

      $scope.publication = {
        $id: '',
        categoryPath: [],
        locationPath: [],
        categories: CATEGORIES,
        locations: LOCATIONS,
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
        }
      };

      if(angular.isDefined($routeParams.publicationId)){
        setPublication($routeParams.publicationId)
          .then(function(){
            $scope.publication.isReady = true;
            deferred.resolve();
          });
      }else{
        $scope.publication.images = []; // If this definition is moved to the main object the images in edit mode after F5 are not recognized.
        $scope.publication.isReady = true;
        deferred.resolve();
      }

      $scope.submit = function(){
        if($scope.publicationForm.$valid){
          var deferred    = $q.defer();

          publicationService.savePublication( $scope.publication.model, $scope.publication.$id, user.uid)
            .then(function(the){
              $scope.publication.$id = $scope.publication.$id !== '' ? $scope.publication.$id : the.publicationId;
              // Save files in Cloudinary
              return imagesService.uploadFiles($scope.publication.images, $scope.publication.$id)
            })
            .then(function (files) {
              return publicationService.saveFilesData($scope.publication.$id, files);
            })
            .then(function(){
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
      };

      $scope.discard = function(){
        console.log($scope.publication.model.title !== '' && $scope.publication.model.title !== undefined  ? $scope.publication.model.title : 'Untitled');

        var modalInstance = $uibModal.open({
          templateUrl: 'static/assets/views/discardPublication.html',
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
            $scope.httpRequestPromise = publicationService.removePublication($scope.publication.$id, user.uid)
              .then(function(){
                notificationService.success('The publication has been deleted.');
                $location.path('/');
              });
          }else{
            notificationService.success('The publication has been discard.');
            $location.path('/');
          }
        }, function (error) {
          //notificationService.error(error);
        });
      };

      function setPublication(publicationId){
        var deferred   = $q.defer();

        publicationService.loadPublication( user.uid, publicationId)
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
              value.$ngfWidth   = value.width;
              value.$ngfHeight  = value.height;
              value.size        = typeof value.size !== 'undefined' ? value.size : value.bytes;
              value.isUploaded  = true;
              value.name        = typeof value.name !== 'undefined' ? value.name : value.original_filename + '.' + value.format;
              $scope.publication.images.push(value);
            })
          })
          .then(function(){
            $scope.publication.$id              = publicationId;

            $scope.publication.categoryPath             = treeService.getPath($scope.publication.model.categoryId,$scope.publication.categories);
            if($scope.publication.categoryPath.length > 0){
              $scope.publication.categorySelected = true;
            }else{
              /**
               * If the <categories> are loaded from the database and it got lost completely or partially temporarily, with this, we force redefine the category.
               *
               * For better performance the <categories> are loaded as dependence constant, already included in the JS build,
               * currently this code should never run (if the <categories> are completely configured from the start), but for X reason some <categories> are deleted,
               * and some publications are making use of deleted <categories>, this code will run.
               * */
              $scope.publication.redefineCategory = true;
              $scope.publication.categorySelected = false;
              $scope.publication.model.categoryId = '';
            }

            $scope.publication.locationPath     = treeService.getPath($scope.publication.model.locationId,$scope.publication.locations);
            if($scope.publication.locationPath.length === 0){
              /**
               * If the <locations> are loaded from the database and it got lost completely or partially temporarily, with this, we force redefine the category.
               *
               * For better performance the <locations> are loaded as dependence constant, already included in the JS build,
               * currently this code should never run (if the <locations> are completely configured from the start), but for X reason some <locations> are deleted,
               * and some publications are making use of deleted <locations>, this code will run.
               * */
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

      $scope.setLocation = function (locationId) {
        $scope.publication.model.locationId          = locationId;
        $scope.publication.locationPath              = treeService.getPath(locationId,$scope.publication.locations);
        $scope.publication.model.locations           = treeService.pathNames($scope.publication.locationPath);
      };

      $scope.setCategory = function (categoryId) {
        $scope.publication.model.categoryId           = categoryId;
        $scope.publication.categoryPath               = treeService.getPath(categoryId,$scope.publication.categories);
        $scope.publication.model.categories           = treeService.pathNames($scope.publication.categoryPath);
        $scope.publication.model.department           = ($scope.publication.categoryPath[0]) ? $scope.publication.categoryPath[0].name : '';
      };

      $scope.$watch(function(){
        return $scope.publication.model.htmlDescription;
      },function(){
        $scope.publication.model.description = $filter('htmlToPlaintext')($scope.publication.model.htmlDescription);
      });



    }])
  .controller('DiscardPublicationController',['$scope', '$uibModalInstance', 'publicationId', 'title',function($scope, $uibModalInstance, publicationId, title){

    $scope.publication = {
      $id: publicationId,
      title: title
    };

    $scope.confirm  = function () {
      $uibModalInstance.close();
    };

    $scope.cancel   = function () {
      $uibModalInstance.dismiss('This has be cancel');
    };

  }])
  .controller('JobsPublicationController',['$scope',function($scope){

    function setEstimatedMonthlySalary (){
      switch($scope.publication.model.jobSalaryType) {
        case 'Annual':
          $scope.publication.model.jobEstimatedMonthlySalary = ($scope.publication.model.jobSalaryStartAt / 12);
          break;
        case 'Daily':
          $scope.publication.model.jobEstimatedMonthlySalary = ($scope.publication.model.jobSalaryStartAt * 21.741);
          break;
        case 'Hourly':
          $scope.publication.model.jobEstimatedMonthlySalary = ($scope.publication.model.jobSalaryStartAt * 8 * 21.741);
          break;
      }
    }

    if (typeof $scope.publication.model.jobSalaryStartAt === 'undefined'){
      $scope.publication.model.jobSalaryStartAt = null;
    }
    if (typeof $scope.publication.model.jobSalaryEndAt === 'undefined'){
      $scope.publication.model.jobSalaryEndAt = null;
    }
    if (typeof $scope.publication.model.jobHasBonus === 'undefined'){
      $scope.publication.model.jobHasBonus = false;
    }
    if (typeof $scope.publication.model.jobHasBenefits === 'undefined'){
      $scope.publication.model.jobHasBenefits = false;
    }
    if (typeof $scope.publication.model.jobSalaryType === 'undefined'){
      $scope.publication.model.jobSalaryType = null;
    }

    $scope.$watch(function(){
      return $scope.publication.model.jobSalaryType;
    },function(){
      setEstimatedMonthlySalary()
    });

    $scope.$watch(function(){
      return $scope.publication.model.jobSalaryStartAt;
    },function(){
      setEstimatedMonthlySalary()
    });

  }])
  .controller('MarketplacePublicationController',['$scope','$filter',function($scope, $filter){

    $scope.$watch(function(){
      return $scope.publication.model.htmlWarranty;
    },function(){
      $scope.publication.model.warranty = $filter('htmlToPlaintext')($scope.publication.model.htmlWarranty);
    });

  }]);