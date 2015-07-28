/* jshint ignore:start */

// https://w3c.github.io/FileAPI/#FileReader-interface
// https://developer.mozilla.org/en-US/docs/Using_files_from_web_applications
// https://developer.mozilla.org/en-US/docs/Web/API/FileReader
// https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL

angular.module('ngUpload',[])
  .directive('ngUpload', ['$q','$window','rfc4122','$log',function ($q,$window,rfc4122,$log) {

    var controller = function ($scope){

      $scope.queueFiles = {};

      $scope.removeAllQueueFiles = function(){
        $scope.queueFiles = {};
      };

      $scope.removeFileFromTheQueueFiles = function(uuid){
        $log.log('the uuid of this file is:', uuid);
        delete $scope.queueFiles[uuid];
      };

    };

    return {
      restrict: 'E',
      templateUrl: 'ngUpload.html',
      scope: {},
      controller:controller,
      link: function(scope, element) {

        scope.queueFiles = scope.queueFiles ? scope.queueFiles : {};
        element.on('change', function (event) {
          angular.forEach(event.target.files,function(file){
            var uuid = rfc4122.v4();
            scope.queueFiles[uuid] =  {
              file: file,
              name: file.name,
              preview:'images/loading.gif'
            };

            scope.$apply(function(scope){
                var reader = new FileReader();
                reader.onerror = function(){
                  // The reading operation encounter an error.
                  scope.queueFiles[uuid].preview        = 'images/error.png';
                  scope.queueFiles[uuid].previewStatus  = 'error';
                  scope.$apply();
                };
                reader.onload = function (loadEvent) {
                  // The reading operation is successfully completed.
                  scope.queueFiles[uuid].preview        = loadEvent.target.result;
                  scope.queueFiles[uuid].previewStatus  = 'success';
                  scope.$apply();
                };
                reader.readAsDataURL(file);
            });

          });
        });

      }
    };
  }]);
