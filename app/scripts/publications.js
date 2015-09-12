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
      }
  };

  }])
  .controller('PublicationsController',['$scope','$q','treeService','publicationsService','notificationService','$filter','fileService','Upload','$log',function($scope,$q,treeService,publicationsService,notificationService,$filter,fileService,Upload,$log){

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

    $scope.submit = function(){
      if($scope.form.$valid){
        if(publicationsService.publicationId !== ''){
          $scope.httpRequestPromise = updateRecord();
        }else{
          $scope.httpRequestPromise = publicationsService.newPublicationId()
            .then(function(ref){
              publicationsService.publicationId = ref.key();
              return updateRecord();
            });
        }
      }
    };

    $scope.inQueue = function(){
      var queue = 0;
      angular.forEach($scope.model.files,function(value){
        if(!angular.isDefined(value.inServer) && !angular.isDefined(value.$error)){
          queue += 1;
        }
      });
      return queue;
    };

    $scope.removeAllQueueFiles = function () {
        angular.copy([],$scope.model.files);
    };

    $scope.removeFile = function(index){
      $log.info('index:  ',index);
      $log.info('$scope.model.files[index]: ',$scope.model.files[index]);
      $scope.model.files.splice(index,1);
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
