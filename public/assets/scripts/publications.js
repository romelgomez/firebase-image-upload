'use strict';

var publicationsModule = angular.module('publications',['uuid','ngMessages','angular-redactor','ngFileUpload'])
  .factory('publicationService',['$q','imagesService',function( $q, imagesService){

    return {
      savePublication : function(publicationModel , publicationsRef, publicationId) {

        if(angular.isDefined(publicationId) && publicationId !== ''){
          // update record
          var deferred = $q.defer();

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
              deferred.resolve();
            }
          });

          return deferred.promise;
        }else{
          // new record
          var newPublicationRef = publicationsRef.push(); // like array element
          publicationModel.releaseDate = $window.Firebase.ServerValue.TIMESTAMP;
          return newPublicationRef.set(publicationModel);
        }

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
    '$log',function($scope, $q, $window, $filter, $routeParams, $location, $http, FireRef, $firebaseArray, $firebaseObject, rfc4122, treeService, notificationService, $upload, user, $uibModal, $log){

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

            savePublication( $scope.publication.model, publicationsRef, $scope.publication.$id)
              .then(function(the){
                console.log('the save data:',angular.fromJson(the));
                console.log('the save data:',angular.toJson(the));
                $scope.publication.$id = $scope.publication.$id !== '' ? $scope.publication.$id : the.publicationId;
                return saveFiles( $scope.publication.images, $scope.publication.$id)
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
            $scope.httpRequestPromise = removePublication()
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

      // images related
      $scope.imagesInfo = function(){
        var info = {
          'inQueue':0,
          'inServer':0,
          'invalid':0
        };
        angular.forEach($scope.publication.images,function(value){
          if(!angular.isDefined(value.inServer) && !angular.isDefined(value.$error)){
            info.inQueue += 1;
          }else{
            if(angular.isDefined(value.inServer)){
              info.inServer += 1;
            }else{
              info.invalid += 1;
            }
          }
        });
        return info;
      };

      $scope.deleteAllPublicationImages = function () {

        deleteImages()
          .then(function(){
            var imagesRef = publicationsRef.child($scope.publication.$id).child('images');
            return imagesRef.set({});
          })
          .then(function () {
            angular.copy([],$scope.publication.images);
            notificationService.success('The images has been deleted');
          },function(){
            notificationService.error('The images cannot be deleted');
          });

      };

      $scope.setAsPrimaryImage = function(imageId){
        $scope.httpRequestPromise = featuredImage(imageId)
          .then(function(){
            $scope.publication.model.featuredImageId = imageId;
            notificationService.success('The file as been selected as featured imagen.');
          });
      };

      $scope.removeFile = function(fileIndex,file){
        if(angular.isDefined(file.inServer)){
          var tasksToDo = {};
          if(file.$id === $scope.publication.model.featuredImageId){
            tasksToDo.blankFeaturedImage = featuredImage().
            then(function(){
              $scope.publication.model.featuredImageId = '';
            });
          }
          tasksToDo.deleteImage = deleteImages([file.$id])
            .then(function(){
              var imageRef = publicationsRef.child($scope.publication.$id).child('images').child(file.$id);
              return imageRef.set({});
            })
            .then(function(){
              removeFile(fileIndex);
            },function(error){
              notificationService.error(error);
            });

          $scope.httpRequestPromise = $q.all(tasksToDo);
        }else{
          removeFile(fileIndex);
        }
      };

      $scope.removeInvalidFiles = function(){
        $scope.publication.images = $filter('filter')($scope.publication.images, function(value) { return !angular.isDefined(value.$error);});
      };

      $scope.removeAllQueueFiles = function () {
        $scope.publication.images = $filter('filter')($scope.publication.images, function(value) {
          return !(!angular.isDefined(value.inServer) && !angular.isDefined(value.$error));
        });
      };

      function pathNames(path){
        var pathNames = [];
        angular.forEach(path,function(pathNode){
          pathNames.push(pathNode.name);
        });
        return pathNames;
      }

      function uploadFile(file, fileId, publicationId){
        var deferred = $q.defer();

        file.upload = $upload.upload({
          url: 'https://api.cloudinary.com/v1_1/berlin/upload',
          fields: {
            public_id: fileId,
            upload_preset: 'ebdyaimw',
            context: 'alt=' + file.name + '|caption=' + file.name +  '|photo=' + file.name + '|$id=' + fileId,
            tags: [publicationId]
          },
          file: file
        }).progress(function (e) {
          file.progress = Math.round((e.loaded * 100.0) / e.total);
        }).success(function (data) {
          file.inServer = true;
          file.$id  = data.context.custom.$id;

          deferred.resolve({
            '$id':data.context.custom.$id
          });
        }).error(function (data) {
          file.details  = data;
          deferred.reject();
        });

        return deferred.promise;
      }

      function saveFiles(files, publicationId){
        var publicationImagesRef = publicationsRef.child(publicationId).child('images');
        var filesPromises = {};
        var filesReferences = {};
        angular.forEach(files,function(file){
          if(!angular.isDefined(file.inServer)){
            var imageRef = publicationImagesRef.push();
            filesReferences[imageRef.key()] = imageRef;
            filesPromises[imageRef.key()]   =  uploadFile(file,imageRef.key(),publicationId)
              .then(function(the){
                return filesReferences[the.$id].set({
                  name:file.name,
                  size:file.size,
                  type:file.type,
                  width:file.width,
                  height:file.height,
                  inServer:true,
                  addedDate: $window.Firebase.ServerValue.TIMESTAMP
                })
              });
          }
        });
        return $q.all(filesPromises);
      }

      function savePublication(publicationModel, publicationsRef, publicationId) {
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
      }


      // TODO ELIMINAR $getRecord
      function removePublication(){
        var deferred                            = $q.defer();
        var publication                         = publications.$getRecord($scope.publication.$id);
        var tasksToDo                           = {};

        tasksToDo.deleteImages = deleteAllPublicationImages();
        tasksToDo.detelePublication = publications.$remove(publication);

        $q.all(tasksToDo)
          .then(function(){
            deferred.resolve();
          }, function (error) {
            notificationService.error(error);
          });

        return deferred.promise;
      }

      /** Delete all files of the publication, And you can selective delete files if their Ids are provider as array
       * @param {Array} imagesIds
       * @return {Promise<Object>}
       * */
      function deleteImages(imagesIds) {
        var deferred = $q.defer();
        var params = {
          publicationId: $scope.publication.$id
        };

        if (typeof imagesIds !== 'undefined' && Array.isArray(imagesIds)){
          params.public_ids = imagesIds;
        }

        $http({
          method: 'DELETE',
          url: '/files',
          params: params
        }).then(function(res){
          deferred.resolve(res);
        },function(error){
          deferred.reject(error);
        });

        return deferred.promise;
      }

      function featuredImage(imageId){
        // TODO ELIMINAR $getRecord
        var record = publications.$getRecord($scope.publication.$id);
        if(angular.isDefined(imageId) && imageId!==''){
          record.featuredImageId = imageId;
        }else{
          record.featuredImageId = '';
        }
        return publications.$save(record);
      }

      function removeFile(fileIndex){
        $scope.publication.images = $filter('filter')($scope.publication.images, function(value, index) { return index !== fileIndex;});
        notificationService.success('The file as been delete.');
      }
      // End images related

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
