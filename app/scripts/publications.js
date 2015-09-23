'use strict';

// añadir soporte a otro tipo de publicación

angular.module('publications',['tree','moreFilters','uuid','ngMessages','angular-redactor','ngFileUpload','angular-loading-bar'])
  .factory('publicationsService',['$q','$window','rfc4122','FireRef','$firebaseArray',function($q,$window,rfc4122,FireRef,$firebaseArray){

    var publications = $firebaseArray(FireRef.child('publications'));

    return {
      deletePublicationImage: function(publicationId,imageId){
        var deferred = $q.defer();
        var image = FireRef.child('publications').child(publicationId).child('images').child(imageId);
        image.update({
          isDeleted: true
        }, function (error) {
          if(error){
            deferred.reject(error);
          }else{
            deferred.resolve();
          }
        });
        return deferred.promise;
      },
      updatePublication: function (publicationId,model){
        var record = publications.$getRecord(publicationId);
        angular.forEach(model,function(value,key){
          record[key] = value;
        });
        return publications.$save(record);
      },
      newPublication: function(publication){
        publication.releaseDate = $window.Firebase.ServerValue.TIMESTAMP;
        return publications.$add(publication);
      }
  };

  }])
  .controller('PublicationsController',['$scope','$q','rfc4122','treeService','publicationsService','notificationService','$filter','fileService','Upload','$log',function($scope,$q,rfc4122,treeService,publicationsService,notificationService,$filter,fileService,$upload,$log){

    //Main Categories [market, jobs] // realEstate, vehicles, boats, planes, stockMarket

    $scope.treeNodes          = treeService.nodes();
    $scope.categoryExpected   = false;
    $scope.path               = [];
    $scope.reference          = '';
    $scope.model = {
      userId:       '1',
      categoryId:   '',
      type:         '',
      files:        []
    };

    $scope.httpRequestPromise = $scope.treeNodes.$loaded(null,function(error){
      notificationService.error(error);
    });

    $scope.setCategory = function (categoryId) {
      $scope.model.categoryId = categoryId;
      $scope.path             = treeService.getPath(categoryId,$scope.treeNodes);
      $scope.model.type       = ($scope.path[0]) ? $filter('camelCase')($scope.path[0].name): '';
    };

    //var updatePublication = function () {
    //  return publicationsService.updatePublication(publicationsService.publicationId,$scope.model)
    //    .then(function() {
    //      notificationService.success('Data has been save to our Firebase database');
    //    },function(error){
    //      notificationService.error(error);
    //    });
    //};

    var uploadFile = function(file,reference){
      var deferred = $q.defer();

      //$log.info('file:',file);

      file.upload = $upload.upload({
        url: "https://api.cloudinary.com/v1_1/berlin/upload",
        fields: {
          public_id: 'publications/'+reference,
          upload_preset: 'ebdyaimw',
          context: 'alt=' + file.name + '|caption=' + file.name +  '|photo=' + file.name + '|reference=' + reference
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
        if(angular.isDefined(file.inServer)){
          _files[file.details.context.custom.reference] = {};
          _files[file.details.context.custom.reference].isDeleted = false;
          _files[file.details.context.custom.reference].details   = file.details;
        }else{
          var reference = rfc4122.v4();
          _files[reference] = uploadFile(file,reference);
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
              if(key === 'files'){
                publication.images = files;
              }else{
                publication[key] = value;
              }
            });

            // Todo ¿como viene files luego de actualizar ... ?
            if($scope.reference === ''){
              return publicationsService.newPublication(publication);
            }else{
              return publicationsService.updatePublication($scope.reference,publication);
            }

          }).then(function (ref) {
            $scope.reference = ref.key();
            notificationService.success('Data has been save');
            deferred.resolve();
          },function(error){
            notificationService.error(error);
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

    $scope.removeFilesInServer = function () {

    };

    $scope.removeInvalidFiles = function(){
      $scope.model.files = $filter('filter')($scope.model.files, function(value) { return !angular.isDefined(value.$error);});
    };

    $scope.removeAllQueueFiles = function () {
      $scope.model.files = $filter('filter')($scope.model.files, function(value) {
        return !(!angular.isDefined(value.inServer) && !angular.isDefined(value.$error));
      });
    };

    $scope.removeFile = function(fileIndex,file){
      var removeFile = function(){
        $scope.model.files = $filter('filter')($scope.model.files, function(value, index) { return index !== fileIndex;});
        notificationService.success('The file as been delete.');
      };

      if(angular.isDefined(file.inServer)){
          publicationsService.deletePublicationImage($scope.reference,file.details.context.custom.reference)
            .then(function(){
              removeFile();
            },function(error){
              notificationService.error(error);
            });
      }else{
        removeFile();
      }
    };


    //$scope.progressInstances = {};
    //
    //var uploadFiles = function () {
    //  fileService.files().then(function(files) {
    //    angular.forEach(files,function(fileObject,reference){
    //      if(fileObject.inServer === false){
    //        $scope.progressInstances[reference] = $q.when(fileService.upload(fileObject,reference));
    //      }
    //    });
    //  });
    //};
    //
    //$scope.uploadFiles = function(){
    //  if(publicationsService.publicationId !== ''){
    //    uploadFiles();
    //  }else{
    //    publicationsService.newPublicationId()
    //      .then(function(ref){
    //        publicationsService.publicationId = ref.key();
    //        uploadFiles();
    //      });
    //  }
    //};
    //
    //fileService.files().then(function(_files_) {
    //  $scope.files  = _files_;
    //});
    //
    //$scope.filesLength  = function(){
    //  return fileService.filesLength();
    //};
    //
    //$scope.queueFiles = function(){
    //  return fileService.queueFiles();
    //};
    //
    //publicationsService.publicationId = '';
    //fileService.removeAllFiles();

  }]);
