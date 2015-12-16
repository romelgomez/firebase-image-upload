'use strict';

angular.module('publications',['tree','uuid','ngMessages','angular-redactor','ngFileUpload','angular-loading-bar'])
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
    '$log',function($scope, $q, $window, $filter, $routeParams, $location, $http, FireRef, $firebaseArray, $firebaseObject, rfc4122, categoriesService, notificationService, $upload, user, $uibModal, $log){

    var userPublicationsRef   = FireRef.child('publications');
    var userPublications      = $firebaseArray(userPublicationsRef);

    // Main Categories [Market, Jobs, RealEstate, Transport, Services]

    $scope.categories             = categoriesService.nodes();
    $scope.categoryExpected       = false;
    $scope.path                   = [];
    $scope.publicationId          = '';
    $scope.images                 = [];
    $scope.isEditing              = false;
    $scope.thePublicationIsReady  = false;
    var original = angular.copy($scope.model = {
      userUid:               user.uid,
      categoryId:           '',
      type:                 '',
      featuredImageId:      '',
      title:                '',
      htmlDescription:      ''
    });

    $scope.$watch(function(scope){
      return scope.model.htmlDescription;
    },function(){
      $scope.model.description = $filter('htmlToPlaintext')($scope.model.htmlDescription);
    });

    $scope.publicationIdStatus = function(){
      return $scope.publicationId !== '';
    };

    var configTasks = {};

    configTasks.categories = $scope.categories.$loaded();

    var pathNames = function(path){
      var pathNames = [];
      angular.forEach(path,function(pathNode){
        pathNames.push(pathNode.name);
      });
      return pathNames;
    };

    $scope.setCategory = function (categoryId) {
      $scope.model.categoryId = categoryId;
      $scope.path             = categoriesService.getPath(categoryId,$scope.categories);
      $scope.model.path       = pathNames($scope.path);
      $scope.model.type       = ($scope.path[0]) ? $filter('camelCase')($scope.path[0].name): '';
    };

    var uploadFile = function(file,fileId,publicationId){
      var deferred = $q.defer();

      file.upload = $upload.upload({
        url: "/files",
        fields: {
          fileId: fileId,
          publicationId: publicationId
        },
        file: file
      }).progress(function (e) {
        file.progress = Math.round((e.loaded * 100.0) / e.total);
        //file.status = "Uploading... " + file.progress + "%";
      }).success(function (data) {
        //$log.info('success - data - to json',angular.toJson(data));
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
    };

    var saveFiles = function(files, publicationId){
      var publicationImagesRef = userPublicationsRef.child(publicationId).child('images');
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
    };

    var savePublication = function (publication,id) {
      if(angular.isDefined(id) && id !== ''){
        var record = userPublications.$getRecord(id);
        angular.forEach(publication,function(value,key){
          if(key !== 'releaseDate'){
            record[key] = value;
          }
        });
        return userPublications.$save(record);
      }else{
        publication.releaseDate = $window.Firebase.ServerValue.TIMESTAMP;
        return userPublications.$add(publication);
      }
    };

    $scope.submit = function(){
      if($scope.publicationForm.$valid){
        var deferred    = $q.defer();

        savePublication( $scope.model, $scope.publicationId)
            .then(function(the){
                $scope.publicationId = $scope.publicationId !== '' ? $scope.publicationId : the.key();
                return saveFiles( $scope.images, $scope.publicationId)
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
    };

    $scope.imagesInfo = function(){
      var info = {
        'inQueue':0,
        'inServer':0,
        'invalid':0
      };
      angular.forEach($scope.images,function(value){
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

    var imagesInQueueToDeleteRef            = FireRef.child('imagesInQueueToDelete');
    var imagesInQueueToDelete               = $firebaseArray(imagesInQueueToDeleteRef);

    var removePublication = function(){
     var deferred                            = $q.defer();
     var publication                         = userPublications.$getRecord($scope.publicationId);
     var imagesToDeleteRef                   = publicationImagesRef.child($scope.publicationId);
     var imagesToDelete                      = $firebaseArray(imagesToDeleteRef);
     var tasksToDo                           = {};
     tasksToDo.imagesInQueueToDeletePromises = {};

     tasksToDo.imagesToDeleteLoadedPromise = imagesToDelete.$loaded(function(){
       angular.forEach(imagesToDelete,function(value){
         tasksToDo.imagesInQueueToDeletePromises[value.$id] = imagesInQueueToDelete.$add({
           id:value.$id
         });
       });
     });

     tasksToDo.userPublicationsRemovePromise = userPublications.$remove(publication);

     $q.all(tasksToDo)
       .then(function(){
          imagesToDeleteRef.remove(function(error){
            if (error) {
              deferred.reject(error);
            } else {
              deferred.resolve();
            }
          })
       }, function (error) {
         notificationService.error(error);
       });

      return deferred.promise;
    };

    $scope.discard = function(){
        var modalInstance = $uibModal.open({
            templateUrl: 'discardPublication.html',
            controller: 'DiscardPublicationController',
            resolve: {
                publicationId:function(){
                  return $scope.publicationId !== '';
                },
                title: function () {
                  return $scope.model.title !== '' && $scope.model.title !== undefined  ? $scope.model.title : 'Untitled';
                }
            }
        });
        modalInstance.result.then(function(){
            if($scope.publicationId !== ''){
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

/*
* deleteAllPublicationImages
* deletePublicationImage
* removePublication
* */

    function deleteAllPublicationImages() {
      var deferred = $q.defer();

      $http({
        method: 'DELETE',
        url: '/files',
        params: {
          tag: $scope.publicationId
        }
      }).then(function(res){
        $log.info('DELETE response:',res);
        deferred.resolve();
      },function(){
        notificationService.error('The images cannot be deleted');
      });


      //angular.forEach(objs, function(val, index){
      //  console.log('val:', val);  // delete
      //  console.log('index', index);  // id
      //});

      /*

       {"deleted":{"publications/-K5b0FySQURNk_MP8PXu":"deleted"},"partial":false,"rate_limit_allowed":500,"rate_limit_reset_at":"2015-12-15T20:00:00.000Z","rate_limit_remaining":499}
       {"deleted":{"publications/-K5b3MUgE3ILdHmF-ifS":"deleted","publications/-K5b3MUi0T_Ovv3BkhZT":"deleted","publications/-K5b0FySQURNk_MP8PXu":"not_found"},"partial":false,"rate_limit_allowed":500,"rate_limit_reset_at":"2015-12-15T20:00:00.000Z","rate_limit_remaining":497}
       {"deleted":{"-K5b0V_UpUMtSV7bSiRd":"not_found"},"partial":false,"rate_limit_allowed":500,"rate_limit_reset_at":"2015-12-15T20:00:00.000Z","rate_limit_remaining":498}

       */


      //function getImagesToDelete(){
      //  var deferred  = $q.defer();
      //  var imagesToDelete = [];
      //
      //  angular.forEach($scope.images, function(imagen, index){
      //    if(angular.isDefined(imagen.inServer) && imagen.inServer === true){
      //      imagesToDelete.push(imagen.$id);
      //    }
      //    if(index === $scope.images.length-1){
      //      deferred.resolve({imagesToDelete: imagesToDelete});
      //    }
      //  });
      //
      //  return deferred.promise;
      //}

      //getImagesToDelete()
      //  .then(function(the){
      //    if(the.imagesToDelete.length > 0){
      //    }else{
      //      deferred.resolve();
      //    }
      //  });

      //var imagesToDeleteRef                   = publicationImagesRef.child($scope.publicationId);
      //var imagesToDelete                      = $firebaseArray(imagesToDeleteRef);
      //var tasksToDo                           = {};
      //tasksToDo.imagesInQueueToDeletePromises = {};
      //tasksToDo.imagesToDeleteLoadedPromise = imagesToDelete.$loaded(function(){
      //  angular.forEach(imagesToDelete,function(value){
      //    tasksToDo.imagesInQueueToDeletePromises[value.$id] = imagesInQueueToDelete.$add({
      //      id:value.$id
      //    });
      //  });
      //});
      //$q.all(tasksToDo)
      //  .then(function(){
      //    imagesToDeleteRef.remove(function(error){
      //      if (error) {
      //        deferred.reject(error);
      //      } else {
      //        deferred.resolve();
      //      }
      //    })
      //  });

      return deferred.promise;
    }

    $scope.deleteAllPublicationImages = function () {
       deleteAllPublicationImages()
         .then(function(){
           angular.copy(original.files,$scope.images);
           notificationService.success('The images has been deleted');
         },function(error){
           notificationService.error(error);
         });
    };

    var deletePublicationImage = function(imageId){
      var deferred = $q.defer();
      var imageToDeleteRef    = publicationImagesRef.child($scope.publicationId).child(imageId);
      var tasksToDo           = {};

      tasksToDo.imagesInQueueToDeletePromise = imagesInQueueToDelete.$add({
        id:imageId
      });

      $q.all(tasksToDo)
        .then(function(){
          imageToDeleteRef.remove(function(error){
            if (error) {
              deferred.reject(error);
            } else {
              deferred.resolve();
            }
          })
        });

      return deferred.promise;
    };

    var featuredImage = function(imageId){
      var record = userPublications.$getRecord($scope.publicationId);
      if(angular.isDefined(imageId) && imageId!==''){
        record.featuredImageId = imageId;
      }else{
        record.featuredImageId = '';
      }
      return userPublications.$save(record);
    };

    $scope.setAsPrimaryImage = function(imageId){
      $scope.httpRequestPromise = featuredImage(imageId)
        .then(function(){
          $scope.model.featuredImageId = imageId;
          notificationService.success('The file as been selected as featured imagen.');
        });
    };

    var removeFile = function(fileIndex){
      $scope.images = $filter('filter')($scope.images, function(value, index) { return index !== fileIndex;});
      notificationService.success('The file as been delete.');
    };

    $scope.removeFile = function(fileIndex,file){
      if(angular.isDefined(file.inServer)){
        var tasksToDo = {};
        if(file.$id === $scope.model.featuredImageId){
          tasksToDo.blankFeaturedImage = featuredImage().
            then(function(){
              $scope.model.featuredImageId = '';
            });
        }
        tasksToDo.deleteImage = deletePublicationImage(file.$id)
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
      $scope.images = $filter('filter')($scope.images, function(value) { return !angular.isDefined(value.$error);});
    };

    $scope.removeAllQueueFiles = function () {
      $scope.images = $filter('filter')($scope.images, function(value) {
        return !(!angular.isDefined(value.inServer) && !angular.isDefined(value.$error));
      });
    };

    var loadPublication  = function (publicationId) {
      var deferred   = $q.defer();

      var publicationRef = userPublicationsRef.child(publicationId);
      var publication = $firebaseObject(publicationRef);

      publication.$loaded(function(){
        deferred.resolve(publication);
      }, function (error) {
        deferred.reject(error);
      });


      return deferred.promise;
    };

    //var loadPublicationImages = function (publicationId) {
    //  var deferred   = $q.defer();
    //
    //  var imagesRef = publicationImagesRef.child(publicationId);
    //  var images = $firebaseArray(imagesRef);
    //
    //  images.$loaded(function(){
    //    deferred.resolve(images);
    //  }, function (error) {
    //    deferred.reject(error);
    //  });
    //
    //  return deferred.promise;
    //};

    var setPublication = function(publicationId){
      var deferred   = $q.defer();

      var loadPublicationPromise = loadPublication(publicationId);

      $q.all({
        publication: loadPublicationPromise
      })
        .then(function (the) {
          angular.forEach(the.publication, function ( value, key) {
            if(key !== 'releaseDate'){
              $scope.model[key] = value;
            }
          });
        })
        .then(function(){
          $scope.publicationId      = publicationId;
          $scope.categoryExpected   = true;
          $scope.isEditing          = true;
          deferred.resolve();
        },function(error){
          deferred.reject(error);
        });

      return deferred.promise;
    };

    if(angular.isDefined($routeParams.publicationId)){
      configTasks.publication = setPublication($routeParams.publicationId);
    }

    $scope.httpRequestPromise = $q.all(configTasks)
      .then(function () {
        $scope.thePublicationIsReady = true;
      });


  }])
  .controller('DiscardPublicationController',['$scope', '$modalInstance', 'publicationId', 'title',function($scope,$modalInstance,publicationId, title){

    $scope.publicationId   = publicationId;
    $scope.title           = title;

    $scope.confirm  = function () {
      $modalInstance.close();
    };

    $scope.cancel   = function () {
      $modalInstance.dismiss('This has be cancel');
    };

  }]);
