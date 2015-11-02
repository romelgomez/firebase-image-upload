'use strict';

angular.module('publications',['tree','uuid','ngMessages','angular-redactor','ngFileUpload','angular-loading-bar'])
  .controller('PublicationsController',[
    '$scope',
    '$q',
    '$window',
    '$filter',
    'FireRef',
    '$firebaseArray',
    '$firebaseObject',
    'rfc4122',
    'treeService',
    'notificationService',
    'Upload',
    'user',
    '$uibModal',
    '$log',function($scope, $q, $window, $filter, FireRef, $firebaseArray, $firebaseObject, rfc4122, treeService, notificationService, $upload, user, $uibModal, $log){

    var userPublicationsRef   = FireRef.child('publications').child(user.uid);
    var userPublications      = $firebaseArray(userPublicationsRef);
    var publicationImagesRef  = FireRef.child('images');

    // Main Categories [Market, Jobs, RealEstate, Transport, Services]

    $scope.treeNodes          = treeService.nodes();
    $scope.categoryExpected   = false;
    $scope.path               = [];
    $scope.publicationId      = '';
    $scope.images              = [];
    var original = angular.copy($scope.model = {
      userId:       user.uid,
      categoryId:   '',
      type:         '',
      featuredImageId:     ''
    });

    $scope.httpRequestPromise = $scope.treeNodes.$loaded(null,function(error){
      notificationService.error(error);
    });

    $scope.setCategory = function (categoryId) {
      $scope.model.categoryId = categoryId;
      $scope.path             = treeService.getPath(categoryId,$scope.treeNodes);
      $scope.model.type       = ($scope.path[0]) ? $filter('camelCase')($scope.path[0].name): '';
    };

    var uploadFile = function(file,fileId){
      var deferred = $q.defer();

      file.upload = $upload.upload({
        url: "https://api.cloudinary.com/v1_1/berlin/upload",
        fields: {
          public_id: 'publications/'+fileId,
          upload_preset: 'ebdyaimw',
          context: 'alt=' + file.name + '|caption=' + file.name +  '|photo=' + file.name + '|fileId=' + fileId
        },
        file: file
      }).progress(function (e) {
        file.progress = Math.round((e.loaded * 100.0) / e.total);
        //file.status = "Uploading... " + file.progress + "%";
      }).success(function (data) {
        //$log.info('success - data - to json',angular.toJson(data));
        file.inServer = true;
        file.fileId  = data.context.custom.fileId;

        deferred.resolve({
          'fileId':data.context.custom.fileId
        });

      }).error(function (data) {
        file.details  = data;
        deferred.reject();
      });

      return deferred.promise;
    };

    var saveFiles = function(files, publicationId){
      var imagesRef = publicationImagesRef.child(publicationId);
      var filesPromises = {};
      var filesReferences = {};
      angular.forEach(files,function(file){
        if(!angular.isDefined(file.inServer)){
          var imageRef = imagesRef.push();
          filesReferences[imageRef.key()] = imageRef;
          filesPromises[imageRef.key()]   =  uploadFile(file,imageRef.key())
            .then(function(the){
              return filesReferences[the.fileId].set({
                name:file.name,
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
        publication.isDeleted = false;
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
        var publication                 = userPublications.$getRecord($scope.publicationId);
        var imagesToDeleteRef           = publicationImagesRef.child($scope.publicationId);
        var imagesToDelete              = $firebaseArray(imagesToDeleteRef);
        var imagesInQueueToDeleteRef    = FireRef.child('imagesInQueueToDelete');
        var imagesInQueueToDelete       = $firebaseArray(imagesInQueueToDeleteRef);

        var tasksToDo = {};

        //imagesRef.on('value',function(snapshot){
        //    $log.info('snapshot.val()',angular.toJson(snapshot.val()));
        //});

        imagesToDelete.$loaded(function(){
            angular.forEach(imagesToDelete,function(value){
                $log.info('value', angular.toJson(value));
            });
        });

        //userPublications.$remove(publication);

        //.then(function(){
        //  notificationService.success('The publication has been deleted');
        //  $window.location = '#/'
        //},function(error){
        //  notificationService.error(error);
        //});

        //record.isDeleted = true;
        //userPublications.$save(record)
        //  .then(function(){
        //    notificationService.success('The publication has been deleted');
        //    $window.location = '#/'
        //  }, function (error) {
        //    notificationService.error(error);
        //  });

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
                    return $scope.model.title !== '' ? $scope.model.title : 'Untitled';
                }
            }
        });
        modalInstance.result.then(function(){
            if($scope.publicationId !== ''){
            }else{
                notificationService.success('The publication has been deleted.');
                $window.location = '#/'
            }
        }, function (error) {
            notificationService.error(error);
        });
    };

    var deleteAllPublicationImages = function (publicationId) {
      var deferred = $q.defer();

      var imagesRef = publicationImagesRef.child(publicationId);

      var images = $firebaseObject(imagesRef);
      images.$loaded()
        .then(function(obj) {

          angular.forEach(obj, function (value, key) {
            obj[key].isDeleted = true;
          });

          obj.$save().then(function() {
            deferred.resolve();
          }, function(error) {
            deferred.reject(error);
          });

        },function(error) {
          deferred.reject(error);
        });

      return deferred.promise;
    };

    $scope.deleteAllPublicationImages = function () {
       deleteAllPublicationImages($scope.publicationId)
         .then(function(){
           angular.copy(original.files,$scope.images);
           notificationService.success('The images has been deleted');
         },function(error){
           notificationService.error(error);
         });
    };

    var deletePublicationImage = function(publicationId,imageId){
      var deferred = $q.defer();
      var imagesRef = publicationImagesRef.child(publicationId).child(imageId);
      imagesRef.update({
        isDeleted: true
      }, function (error) {
        if(error){
          deferred.reject(error);
        }else{
          deferred.resolve();
        }
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
        if(file.fileId === $scope.model.featuredImageId){
          tasksToDo.blankFeaturedImage = featuredImage().
            then(function(){
              $scope.model.featuredImageId = '';
            });
        }
        tasksToDo.deleteImage = deletePublicationImage($scope.publicationId,file.fileId)
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

  }])
  .controller('DiscardPublicationController',['$scope', '$modalInstance', 'publicationId', 'title',function($scope,$modalInstance,publicationId, title){

    $scope.publicationId           = publicationId;
    $scope.title           = title;

    $scope.confirm  = function () {
      $modalInstance.close();
    };

    $scope.cancel   = function () {
      $modalInstance.dismiss('This has be cancel');
    };

  }]);
