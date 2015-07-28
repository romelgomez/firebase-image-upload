'use strict';

angular.module('fileUpload',[])
  .controller('FileUploadController', ['$scope','fileUploadService','$log',function ($scope,fileUploadService,$log) {

    $scope.queueFiles = fileUploadService.getFiles();

    $scope.removeAllQueueFiles = function(){
      $log.log('removeAllQueueFiles is called.');
    };

    $scope.removeFileFromTheQueueFiles = function(reference){
      $log.info('removeFileFromTheQueueFiles is called.');
      $log.info('The reference is:',reference);
    };

  }])
  .factory('fileUploadService',['$q','rfc4122','$log',function ($q,rfc4122,$log) {

    var queueFiles  = {};

    return {
      getFiles: function(){
        return queueFiles;
      },
      addFile: function (file) {
        var deferred = $q.defer();
        var promise = deferred.promise;
        var uuid    = rfc4122.v4();
        // creating file object
        queueFiles[uuid]          = {};
        queueFiles[uuid].file     = file;
        queueFiles[uuid].fileName = file.name;
        queueFiles[uuid].preview  = 'images/loading.gif';
        if(queueFiles[uuid]){
          deferred.resolve(uuid); // reference
        }else{
          deferred.reject('Undefined reference, check rfc4122 dependence.');
        }
        return promise;
      },
      readFile:function(reference){
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
        reader.readAsDataURL(queueFiles[reference].file);
        return promise;
      },
      updateFileObj:function(reference,reading){
        queueFiles[reference].preview = reading;
      }
    };

  }])
  .directive('fileUpload',['$q','fileUploadService',function($q,fileUploadService){
    return {
      restrict: 'E',
      templateUrl: 'fileUpload.html',
      scope: {},
      link: function (scope,element) {
        element.on('change', function (event) {
          angular.forEach(event.target.files,function(file){

            fileUploadService.addFile(file)
              .then(function(reference){
                // read file
                var referencePromise  = $q.when(reference);
                var reading           = fileUploadService.readFile(reference);
                return $q.all([referencePromise,reading]);
              })
              .then(function(arrayData){
                // update file object
                var reference = arrayData[0];
                var reading   = arrayData[1];
                fileUploadService.updateFileObj(reference,reading);
              });

          });
        });
      }
    };
  }])
  .directive('preview',['$log',function ($log) {
    // preview data-preview-img="{{value.preview}}"
    return {
      restrict: 'A',
      scope: {
        previewImg:'='
      },
      link: function (scope,element,attrs) {

        scope.$watch(function(scope) { return scope.previewImg; },
          function() {
            $log.info('scope.previewImg',scope.previewImg);
            if(scope.previewImg !== undefined){
              attrs.src   = scope.previewImg;
              attrs.ngSrc = scope.previewImg;

              $log.info('attrs.src:',   attrs.src);
              $log.info('attrs.ngSrc:', attrs.ngSrc);

            }
          }
        );

      }
    };
  }]);




// https://w3c.github.io/FileAPI/#FileReader-interface
// https://developer.mozilla.org/en-US/docs/Using_files_from_web_applications
// https://developer.mozilla.org/en-US/docs/Web/API/FileReader
// https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL

//angular.module('ngUploadLegacy',[])
//  .directive('ngUpload', ['$q','$window','rfc4122','$log',function ($q,$window,rfc4122,$log) {
//
//    var controller = function ($scope){
//
//      $scope.queueFiles = {};
//
//      $scope.removeAllQueueFiles = function(){
//        $scope.queueFiles = {};
//      };
//
//      $scope.removeFileFromTheQueueFiles = function(uuid){
//        $log.log('the uuid of this file is:', uuid);
//        delete $scope.queueFiles[uuid];
//      };
//
//    };
//
//    return {
//      restrict: 'E',
//      templateUrl: 'ngUpload.html',
//      scope: {},
//      controller:controller,
//      link: function(scope, element) {
//
//        scope.queueFiles = scope.queueFiles ? scope.queueFiles : {};
//        element.on('change', function (event) {
//          angular.forEach(event.target.files,function(file){
//            var uuid = rfc4122.v4();
//            scope.queueFiles[uuid] =  {
//              file: file,
//              name: file.name,
//              preview:'images/loading.gif'
//            };
//
//            scope.$apply(function(scope){
//              var reader = new FileReader();
//              reader.onerror = function(){
//                // The reading operation encounter an error.
//                scope.queueFiles[uuid].preview        = 'images/error.png';
//                scope.queueFiles[uuid].previewStatus  = 'error';
//                scope.$apply();
//              };
//              reader.onload = function (loadEvent) {
//                // The reading operation is successfully completed.
//                scope.queueFiles[uuid].preview        = loadEvent.target.result;
//                scope.queueFiles[uuid].previewStatus  = 'success';
//                scope.$apply();
//              };
//              reader.readAsDataURL(file);
//            });
//
//          });
//        });
//
//      }
//    };
//  }]);




//.directive('ngDropZone', ['$window','$log',function ($window,$log) {
//
//
//  //myDropzone.on("addedfile", function(file) {
//  //  file.previewElement.addEventListener("click", function() {
//  //    myDropzone.removeFile(file);
//  //  });
//  //});
//
//  var controller = function ($scope){
//
//    $scope.firstFiles = function(){
//      $log.log('ok');
//    };
//
//    //$scope.continueUpload   = false;
//    //$scope.uploadAllButton  = false;
//
//    $scope.dropZoneConfig = {
//      options: {
//        url: 'upload.php',
//        previewsContainer: '#previews',  // Define the container to display the previews
//        clickable: '.clickable',         // Define the element that should be used as click trigger to select files.
//        paramName: 'image',              // The name that will be used to transfer the file
//        maxFilesize: 10,                 // MB
//        acceptedFiles: 'image/*',
//        autoQueue: false,
//        //previewTemplate: layout,
//        init: function() {
//
//          $scope.$watch(function(scope) { return scope.dropZoneInstance; },
//            function() {
//              //$log.log('$scope.dropZone ',$scope.dropZoneInstance);
//
//            }
//          );
//
//        }
//      },
//      eventHandlers: {
//        'addedfile': function (file) {
//
//          //$scope.firstFiles();
//          //$log.log('getFilesWithStatus',$scope.dropZoneInstance.getFilesWithStatus(Dropzone.ADDED));
//          //removeButton(myDropzone,file);
//
//
//        },
//        'sending': function (file, xhr, formData) {
//          //formData.append("product_id", $('#ProductId').val());
//        },
//        'success': function (file, response) {
//        },
//        'error': function (file, error, response) {
//        }
//      }
//    };
//
//  };
//
//  return {
//    restrict: 'AE',
//    templateUrl: 'dropZoneTemplate.html',
//    transclude: true,
//    scope: {
//      dropZoneInstance: '=',
//      dropZoneConfig: '='
//    },
//    controller:controller,
//    link: function(scope, element) {
//      if(!angular.isDefined($window.Dropzone)){ throw new Error('DropZone.js not loaded.'); }
//
//      scope.dropZoneConfig = {
//        options: angular.isDefined(scope.dropZoneConfig.options) ? scope.dropZoneConfig.options : {},
//        eventHandlers: angular.isDefined(scope.dropZoneConfig.eventHandlers) ? scope.dropZoneConfig.eventHandlers : {}
//      };
//
//      var dropZoneInstance = new $window.Dropzone(element[0], scope.dropZoneConfig.options);
//
//      angular.forEach(scope.dropZoneConfig.eventHandlers, function (handler, event) {
//        dropZoneInstance.on(event, handler);
//      });
//
//      scope.dropZoneInstance = dropZoneInstance;
//    }
//  };
//}]);
