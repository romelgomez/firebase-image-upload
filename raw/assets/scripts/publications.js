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

    var savePublicationFiles = function(files,publicationId){
      var imagesRef = publicationImagesRef.child(publicationId);
      var images = $firebaseArray(imagesRef);
      var filesPromisesObject = {};
      angular.forEach(files, function(file,fileId){
        filesPromisesObject[fileId] = images.$add(file);
      });
      return $q.all(filesPromisesObject);
    };

    var savePublication = function (publication,id) {
      if(angular.isDefined(id) && id !== ''){
        var record = userPublications.$getRecord(id);
        angular.forEach(publication,function(value,key){
          record[key] = value;
        });
        return userPublications.$save(record);
      }else{
        publication.isDeleted = false;
        publication.releaseDate = $window.Firebase.ServerValue.TIMESTAMP;
        return userPublications.$add(publication);
      }
    };

    // Main Categories [Market, Jobs, RealEstate, Transport, Services]

    $scope.treeNodes          = treeService.nodes();
    $scope.categoryExpected   = false;
    $scope.path               = [];
    $scope.publicationId      = '';
    var original = angular.copy($scope.model = {
      userId:       user.uid,
      categoryId:   '',
      type:         '',
      mainFile:     '',
      files:        []
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
        file.details  = data;
        deferred.resolve({
          isDeleted:false,
          details:data
        });
      }).error(function (data) {
        file.details  = data;
        deferred.reject({});
      });

      return deferred.promise;
    };

    var uploadFiles = function(files){
      var _files = {};
      angular.forEach(files,function(file){
        if(!angular.isDefined(file.inServer)){
          var fileId = rfc4122.v4();
          if($scope.model.mainFile === ''){ $scope.model.mainFile = fileId; }
          _files[fileId] = uploadFile(file,fileId);
        }
      });
      return $q.all(_files);
    };

    $scope.submit = function(){
      if($scope.publicationForm.$valid){
        var deferred    = $q.defer();
        var publication = {};

        uploadFiles($scope.model.files)
          .then(function (files) {
            angular.forEach($scope.model, function (value,key) {
              if(key !== 'files'){
                publication[key] = value;
              }
            });
            return $q.all({
              'publication': savePublication(publication,$scope.publicationId),
              'files':files
            });
          })
          .then(function (the) {
            $scope.publicationId = $scope.publicationId !== '' ? $scope.publicationId : the.publication.key();
            if(Object.keys(the.files).length > 0){
              return savePublicationFiles(the.files,$scope.publicationId);
            }else{
              return $q.when(true);
            }
          })
          .then(function (filesPromisesObject) {

            // TODO existen dos IDs el UUID local, y el de fireBase.
            angular.forEach(filesPromisesObject, function(filesPromise, fileUID){
              //$scope.model.files[fileUID].fileFireID = filesPromise.key();
              $log.info('filesPromise.key() : ',filesPromise.key());
              $log.info('fileUID :',fileUID);
            });

            $log.info('$scope.model.files :', $scope.model.files);

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
      angular.forEach($scope.model.files,function(value){
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

    //var deleteAllPublicationImages = function (publicationId) {
    //  var deferred = $q.defer();
    //
    //  var imagesRef = userPublicationsRef.child(publicationId).child('images');
    //
    //  var images = $firebaseObject(imagesRef);
    //  images.$loaded()
    //    .then(function(obj) {
    //
    //      angular.forEach(obj, function (value, key) {
    //        obj[key].isDeleted = true;
    //      });
    //
    //      obj.$save().then(function() {
    //        deferred.resolve();
    //      }, function(error) {
    //        deferred.reject(error);
    //      });
    //
    //    })
    //    .catch(function(error) {
    //      deferred.reject(error);
    //    });
    //
    //  return deferred.promise;
    //};
    //
    //$scope.deleteAllPublicationImages = function () {
    //   deleteAllPublicationImages($scope.publicationId)
    //     .then(function(){
    //       angular.copy(original.files,$scope.model.files);
    //       notificationService.success('The images has been deleted');
    //     },function(error){
    //       notificationService.error(error);
    //     });
    //};

    $scope.removeInvalidFiles = function(){
      $scope.model.files = $filter('filter')($scope.model.files, function(value) { return !angular.isDefined(value.$error);});
    };

    $scope.removeAllQueueFiles = function () {
      $scope.model.files = $filter('filter')($scope.model.files, function(value) {
        return !(!angular.isDefined(value.inServer) && !angular.isDefined(value.$error));
      });
    };

    //var deletePublicationImage = function(publicationId,imageId){
    //  var deferred = $q.defer();
    //  var imagesRef = publicationImagesRef.child(publicationId).child(imageId);
    //  imagesRef.update({
    //    isDeleted: true
    //  }, function (error) {
    //    if(error){
    //      deferred.reject(error);
    //    }else{
    //      deferred.resolve();
    //    }
    //  });
    //  return deferred.promise;
    //};

    //$scope.removeFile = function(fileIndex,file){
    //  var removeFile = function(){
    //    $scope.model.files = $filter('filter')($scope.model.files, function(value, index) { return index !== fileIndex;});
    //    notificationService.success('The file as been delete.');
    //  };
    //
    //  if(angular.isDefined(file.inServer)){
    //
    //    $log.info('file.details.context.custom.fileId: ',file.details.context.custom.fileId);
    //
    //      //deletePublicationImage($scope.publicationId,file.details.context.custom.fileId)
    //      //  .then(function(){
    //      //    removeFile();
    //      //  },function(error){
    //      //    notificationService.error(error);
    //      //  });
    //  }else{
    //    removeFile();
    //  }
    //};

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
