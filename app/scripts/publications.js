'use strict';

// añadir soporte a otro tipo de publicación

angular.module('publications',['tree','moreFilters','uuid','ngMessages','angular-redactor'])
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
  .controller('PublicationsController',['$scope','$q','treeService','publicationsService','notificationService','$filter','fileService',function($scope,$q,treeService,publicationsService,notificationService,$filter,fileService){

    //Main Categories [market, jobs] // realEstate, vehicles, boats, planes, stockMarket

    $scope.treeNodes          = treeService.nodes();
    $scope.categoryExpected   = false;
    $scope.path               = [];
    $scope.model = {
      userId:       '1',
      categoryId:   '',
      type:         ''
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

    $scope.progressInstances = {};

    var uploadFiles = function () {
      fileService.files().then(function(files) {
        angular.forEach(files,function(fileObject,reference){
          if(fileObject.inServer === false){
            $scope.progressInstances[reference] = $q.when(fileService.upload(fileObject,reference));
          }
        });
      });
    };

    $scope.uploadFiles = function(){
      if(publicationsService.publicationId !== ''){
        uploadFiles();
      }else{
        $scope.httpRequestPromise = publicationsService.newPublicationId()
          .then(function(ref){
            publicationsService.publicationId = ref.key();
            uploadFiles();
          });
      }
    };

    fileService.files().then(function(_files_) {
      $scope.files  = _files_;
    });

    $scope.filesLength  = function(){
      return fileService.filesLength();
    };

    $scope.queueFiles = function(){
      return fileService.queueFiles();
    };

  }]);
