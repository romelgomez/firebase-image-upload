'use strict';

// añadir soporte a otro tipo de publicación

angular.module('publications',['tree','moreFilters','uuid','ngMessages','angular-redactor','ngFileUpload'])
  .factory('publicationsService',['$q','$window','rfc4122','FireRef','$firebaseArray',function($q,$window,rfc4122,FireRef,$firebaseArray){

    var publications = $firebaseArray(FireRef.child('publications'));

    return {
      publicationId:'',
      updateRecord: function (publicationId,model){
        var record = publications.$getRecord(publicationId);
        angular.forEach(model,function(value,key){
          if(key === 'releaseDate'){
            record[key] = (record[key]) ? record[key] : $window.Firebase.ServerValue.TIMESTAMP;
          }else{
            record[key] = value;
          }
        });
        return publications.$save(record);
      },
      newPublicationId: function(){
        return publications.$add({uuid:rfc4122.v4()});
      },
      newPublication: function(publication){
        return publications.$add(publication);
      }
  };

  }])
  .controller('PublicationsController',['$scope','$q','rfc4122','treeService','publicationsService','notificationService','$filter','fileService','Upload','$log',function($scope,$q,rfc4122,treeService,publicationsService,notificationService,$filter,fileService,$upload,$log){

    //Main Categories [market, jobs] // realEstate, vehicles, boats, planes, stockMarket

    $scope.treeNodes          = treeService.nodes();
    $scope.categoryExpected   = false;
    $scope.path               = [];
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

    var updateRecord = function () {
      return publicationsService.updateRecord(publicationsService.publicationId,$scope.model)
        .then(function() {
          notificationService.success('Data has been save to our Firebase database');
        },function(error){
          notificationService.error(error);
        });
    };

    var uplodadFile = function(file,reference){
      var deferred = $q.defer();

      $log.info('file:',file);

      file.upload = $upload.upload({
        url: "https://api.cloudinary.com/v1_1/berlin/upload",
        fields: {
          public_id: 'publications/'+reference,
          upload_preset: 'ebdyaimw',
          context: 'alt=' + file.name + '|caption=' + file.name +  '|photo=' + file.name
        },
        file: file
      }).progress(function (e) {

        file.progress = Math.round((e.loaded * 100.0) / e.total);
        file.status = "Uploading... " + file.progress + "%";

      }).success(function (data, status, headers, config) {

        $log.info('success - data - to json',angular.toJson(data));

        file.inServer = true;

        // isDeleted
        // name

        deferred.resolve({
          isDeleted:false,
          public_id:data.public_id
        });

        //$rootScope.photos = $rootScope.photos || [];
        //data.context = {custom: {photo: $scope.title}};
        //file.result = data;
        //$rootScope.photos.push(data);

      }).error(function (data, status, headers, config) {

        $log.info('error - data',data);
        deferred.reject(error);

        //file.result = data;

      });

      return deferred.promise;
    };

    // Todo filtar los archivos, evitar re-enviar, enviar uno invalido, ...
    var uploadFiles = function(files){
      var _files = {};
      angular.forEach(files,function(file){
        var reference = rfc4122.v4();
        _files[reference] = uplodadFile(file,reference);
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

            return publicationsService.newPublication(publication);
          }).then(function () {
            notificationService.success('Data has been save');
            deferred.resolve();
          },function(error){
            notificationService.error(error);
          });


        $scope.httpRequestPromise = deferred.promise;
      }else{
        notificationService.error('something missing');
      }
    };

    $scope.inQueue = function(){
      var queue = 0;
      angular.forEach($scope.model.files,function(value){

        $log.info('value.$error',value.$error);

        if(!angular.isDefined(value.inServer) && !angular.isDefined(value.$error)){
          queue += 1;
        }

      });
      return queue;
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

    $scope.removeFile = function(fileIndex){
      // TODO check with the fileIndex, the object, if the file It's in the server. to delete first front the server before deleting from the array
      //$log.info('fileIndex',fileIndex);
      $scope.model.files = $filter('filter')($scope.model.files, function(value, index) { return index !== fileIndex;});
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
