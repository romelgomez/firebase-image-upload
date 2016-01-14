'use strict';

var publicationsModule = angular.module('publications',['categories','uuid','ngMessages','angular-redactor','ngFileUpload'])
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
    'categoriesService',
    'notificationService',
    'Upload',
    'user',
    '$uibModal',
    '$log',function($scope, $q, $window, $filter, $routeParams, $location, $http, FireRef, $firebaseArray, $firebaseObject, rfc4122, categoriesService, notificationService, $upload, user, $uibModal, $log){

      var deferred = $q.defer();
      var publicationsRef = FireRef.child('publications');
      var publications  = $firebaseArray(publicationsRef);

      $scope.httpRequestPromise = deferred.promise;

      $scope.publication = {
        $id: '',
        path: [],
        categories: $firebaseArray(FireRef.child('categories').orderByChild('left')),
        categorySelected: false,
        inEditMode: false,
        isReady: false,
        model : {
          userID:               user.uid,
          categoryId:           '',
          featuredImageId:      '',
          department:           '',
          title:                '',
          htmlDescription:      '',
          barcode:              '',
          barcodeType:          'CODE128'
        },
        setCategory: function (categoryId) {
          $scope.publication.model.categoryId           = categoryId;
          $scope.publication.path                       = categoriesService.getPath(categoryId,$scope.publication.categories);
          $scope.publication.model.categories           = pathNames($scope.publication.path);
          $scope.publication.model.department           = ($scope.publication.path[0]) ? $scope.publication.path[0].name : ''; // $filter('camelCase')($scope.publication.path[0].name)
        },
        submit: function(){
          if($scope.publicationForm.$valid){
            var deferred    = $q.defer();

            savePublication( $scope.publication.model, $scope.publication.$id)
              .then(function(the){
                $scope.publication.$id = $scope.publication.$id !== '' ? $scope.publication.$id : the.key();
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

      $scope.publication.categories.$loaded()
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

      function savePublication(publication,id) {
        if(angular.isDefined(id) && id !== ''){
          var record = publications.$getRecord(id);
          angular.forEach(publication,function(value,key){
            if(key !== 'releaseDate'){
              record[key] = value;
            }
          });
          return publications.$save(record);
        }else{
          publication.releaseDate = $window.Firebase.ServerValue.TIMESTAMP;
          return publications.$add(publication);
        }
      }

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
            $scope.publication.$id      = publicationId;
            $scope.publication.path               = categoriesService.getPath($scope.publication.model.categoryId,$scope.publication.categories);
            $scope.publication.categorySelected   = true;
            $scope.publication.inEditMode          = true;
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
