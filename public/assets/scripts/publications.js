'use strict';

angular.module('publications',['categories','uuid','ngMessages','angular-redactor','ngFileUpload','angular-loading-bar'])
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
      featuredImageId:      '',
      department:           '',
      title:                '',
      htmlDescription:      ''
    });

    $scope.$watch(function(scope){
      return scope.model.htmlDescription;
    },function(){
      $scope.model.description = $filter('htmlToPlaintext')($scope.model.htmlDescription);
    });

    $scope.$watch(function(scope){
      return scope.model.htmlWarranty;
    },function(){
      $scope.model.warranty = $filter('htmlToPlaintext')($scope.model.htmlWarranty);
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
      $scope.model.categoryId           = categoryId;
      $scope.path                       = categoriesService.getPath(categoryId,$scope.categories);
      $scope.model.path                 = pathNames($scope.path);
      $scope.model.department  = ($scope.path[0]) ? $scope.path[0].name : ''; // $filter('camelCase')($scope.path[0].name)
    };

    //var uploadFile = function(file,fileId,publicationId){
    //  var deferred = $q.defer();
    //
    //  file.upload = $upload.upload({
    //    url: "/files",
    //    fields: {
    //      fileId: fileId,
    //      publicationId: publicationId
    //    },
    //    file: file
    //  }).progress(function (e) {
    //    file.progress = Math.round((e.loaded * 100.0) / e.total);
    //  }).success(function (data) {
    //    file.inServer = true;
    //    file.$id  = data.context.custom.$id;
    //    deferred.resolve({
    //      '$id':data.context.custom.$id
    //    });
    //  }).error(function (data) {
    //    file.details  = data;
    //    deferred.reject();
    //  });
    //
    //  return deferred.promise;
    //};

      var uploadFile = function(file, fileId, publicationId){
        var deferred = $q.defer();

        file.upload = $upload.upload({
          url: "https://api.cloudinary.com/v1_1/berlin/upload",
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

    var removePublication = function(){
     var deferred                            = $q.defer();
     var publication                         = userPublications.$getRecord($scope.publicationId);
     var tasksToDo                           = {};

     tasksToDo.deleteImages = deleteAllPublicationImages();
     tasksToDo.detelePublication = userPublications.$remove(publication);

     $q.all(tasksToDo)
       .then(function(){
          deferred.resolve();
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

    /** Delete all files of the publication, And you can selective delete files if their Ids are provider as array
     * @param {Array} imagesIds
     * @return {Promise<Object>}
     * */
    function deleteImages(imagesIds) {
      var deferred = $q.defer();
      var params = {
        publicationId: $scope.publicationId
      };

      if (typeof imagesIds !== "undefined" && Array.isArray(imagesIds)){
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

    $scope.deleteAllPublicationImages = function () {

      deleteImages()
         .then(function(){
           var imagesRef = userPublicationsRef.child($scope.publicationId).child('images');
           return imagesRef.set({});
         })
         .then(function () {
           angular.copy([],$scope.images);
           notificationService.success('The images has been deleted');
         },function(){
           notificationService.error('The images cannot be deleted');
         });

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

    function removeFile(fileIndex){
      $scope.images = $filter('filter')($scope.images, function(value, index) { return index !== fileIndex;});
      notificationService.success('The file as been delete.');
    }

    $scope.removeFile = function(fileIndex,file){
      if(angular.isDefined(file.inServer)){
        var tasksToDo = {};
        if(file.$id === $scope.model.featuredImageId){
          tasksToDo.blankFeaturedImage = featuredImage().
            then(function(){
              $scope.model.featuredImageId = '';
            });
        }
        tasksToDo.deleteImage = deleteImages([file.$id])
          .then(function(){
            var imageRef = userPublicationsRef.child($scope.publicationId).child('images').child(file.$id);
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
        if (typeof publication.releaseDate === "undefined"){
          deferred.reject('404');
        } else if (user.uid !== publication.userUid) {
          deferred.reject('401');
        } else {
          deferred.resolve({publication:publication});
        }
      }, function (error) {
        deferred.reject(error);
      });

      return deferred.promise;
    };

    var setPublication = function(publicationId){
      var deferred   = $q.defer();

      loadPublication(publicationId)
        .then(function (the) {
          angular.forEach(the.publication, function ( value, key) {
            if(key !== 'releaseDate'){
              $scope.model[key] = value;
            }
          });
        })
        .then(function(){
          angular.forEach($scope.model.images, function(value, key){
            value.$id = key;
            $scope.images.push(value);
          })
        })
        .then(function(){
          $scope.publicationId      = publicationId;
          $scope.path               = categoriesService.getPath($scope.model.categoryId,$scope.categories);
          $scope.categoryExpected   = true;
          $scope.isEditing          = true;
          deferred.resolve();
        },function(error){
          $location.path('/');
          deferred.reject(error);
        });

      return deferred.promise;
    };

    var deferred   = $q.defer();
    $scope.httpRequestPromise = deferred.promise;

    $q.all(configTasks)
      .then(function () {
        if(angular.isDefined($routeParams.publicationId)){
         return setPublication($routeParams.publicationId);
        }
      })
      .then(function(){
        $scope.thePublicationIsReady = true;
        deferred.resolve();
      })


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
