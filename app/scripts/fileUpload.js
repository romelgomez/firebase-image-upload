'use strict';

angular.module('fileUpload',[])
  .controller('FileUploadController', ['$scope','$q','rfc4122','$log',function ($scope,$q,rfc4122,$log) {

    $scope.formFiles   = [];
    $scope.queueFiles  = {};

    $scope.$watch(function(scope) { return scope.formFiles; },
      function() {
        angular.forEach($scope.formFiles,function(file){
          addFile(file)
            .then(function(reference){
              // read file
              var referencePromise  = $q.when(reference);
              var reading           = readFile(reference);
              return $q.all([referencePromise,reading]);
            })
            .then(function(arrayData){
              // update file object
              var reference = arrayData[0];
              var reading   = arrayData[1];
              updateFileObj(reference,reading);
            });
        });
      }
    );

    var addFile = function (file) {
      var deferred = $q.defer();
      var promise = deferred.promise;
      var uuid    = rfc4122.v4();
      // creating file object
      $scope.queueFiles[uuid]          = {};
      $scope.queueFiles[uuid].file     = file;
      $scope.queueFiles[uuid].fileName = file.name;
      $scope.queueFiles[uuid].preview  = 'images/loading.gif';
      if($scope.queueFiles[uuid]){
        deferred.resolve(uuid); // reference
      }else{
        deferred.reject('Undefined reference, check rfc4122 dependence.');
      }
      return promise;
    };

    var readFile =function(reference){
      var deferred = $q.defer();
      var promise = deferred.promise;
      var reader = new FileReader();
      reader.onerror = function(error){
        // The reading operation encounter an error.
        deferred.reject(error);
      };
      reader.onload = function (loadEvent) {
        // The reading operation is successfully completed.
        deferred.resolve(loadEvent.target.result);
      };
      reader.readAsDataURL($scope.queueFiles[reference].file);
      return promise;
    };

    var updateFileObj = function(reference,reading){
      $scope.queueFiles[reference].preview = reading;
    };

    $scope.removeAllQueueFiles = function(){
      $log.log('removeAllQueueFiles is called.');
      $scope.queueFiles = {}
    };

    $scope.removeFileFromTheQueueFiles = function(reference){
      $log.info('removeFileFromTheQueueFiles is called.');
      $log.info('The reference is:',reference);
      delete $scope.queueFiles[reference];
    };

  }])
  .directive('fileUpload',[function(){
    return {
      restrict: 'E',
      templateUrl: 'fileUpload.html',
      scope: {
        files:'='
      },
      link: function (scope,element) {
        element.on('change', function (event) {
          scope.files = event.target.files;
          scope.$apply();
        });
      }
    };
  }]);
