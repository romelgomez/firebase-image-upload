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
    '$log',function($scope, $q, $window, $filter, FireRef, $firebaseArray, $firebaseObject, rfc4122, treeService, notificationService, $upload, user, $log){

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
      mainFile:     ''
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
              return filesReferences[the.fileId].set({isDeleted:false})
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

    $scope.discard = function(){
      if($scope.publicationId !== ''){
        var record = userPublications.$getRecord(publicationId);
        record.isDeleted = true;
        userPublications.$save(record)
          .then(function(){
            notificationService.success('The publication has been deleted');
            $window.location = '#/'
          }, function (error) {
            notificationService.error(error);
          });
      }else{
        notificationService.success('The publication has been deleted.');
        $window.location = '#/'
      }
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

    $scope.removeFile = function(fileIndex,file){
      var removeFile = function(){
        $scope.images = $filter('filter')($scope.images, function(value, index) { return index !== fileIndex;});
        notificationService.success('The file as been delete.');
      };

      if(angular.isDefined(file.inServer)){
        deletePublicationImage($scope.publicationId,file.fileId)
          .then(function(){
            removeFile();
          },function(error){
            notificationService.error(error);
          });
      }else{
        removeFile();
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

    $scope.setAsPrimaryImage = function(imageId){
      var record = userPublications.$getRecord($scope.publicationId);
      record.mainFile = imageId;
      $scope.httpRequestPromise = userPublications.$save(record)
        .then(function(){
          $scope.model.mainFile = imageId;
          notificationService.success('The file as been selected as primary image.');
        });
    }

  }]);
