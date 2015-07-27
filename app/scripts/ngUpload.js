// https://w3c.github.io/FileAPI/#FileReader-interface
// https://developer.mozilla.org/en-US/docs/Using_files_from_web_applications
// https://developer.mozilla.org/en-US/docs/Web/API/FileReader
// https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL

angular.module('ngUpload',[])
  .controller('NgUploadController',['$scope',function($scope){

    $scope.queueFiles = [];

    //scope.$watch(function(scope) { return scope.queueFiles; },
    //  function() {
    //
    //    //angular.forEach(scope.queueFiles, function(value,index){
    //    //    //value
    //    //});
    //  }
    //);


  }])
  .directive('ngUpload', ['$q','$window','rfc4122','$log',function ($q,$window,rfc4122,$log) {

    var controller = function ($scope){
    };

    return {
      restrict: 'E',
      templateUrl: 'ngUpload.html',
      scope: {
        queueFiles:'='
      },
      controller:controller,
      link: function(scope, element) {

        scope.queueFiles = scope.queueFiles ? scope.queueFiles : {};
        element.on('change', function (event) {
          angular.forEach(event.target.files,function(file){
            var uuid = rfc4122.v4();
            scope.queueFiles[uuid] =  {
              file:file
            };
            var reader = new FileReader();
            reader.onloadstart = function () {
              scope.$apply(function () {
                scope.queueFiles[[uuid]].preview = 'images/loading.gif';
              });
            };
            reader.onload = function (loadEvent) {
              scope.$apply(function () {
                scope.queueFiles[[uuid]].preview = loadEvent.target.result;
              });
            };
            reader.readAsDataURL(file);
          });
        });


        //scope.queueFiles = scope.queueFiles ? scope.queueFiles : [];
        //element.on('change', function (event) {
        //  angular.forEach(event.target.files,function(file){
        //    var reader = new FileReader();
        //    reader.onload = function (loadEvent) {
        //      scope.$apply(function () {
        //        scope.queueFiles.push({
        //          preview:loadEvent.target.result,
        //          file:file
        //        });
        //      });
        //    };
        //    reader.readAsDataURL(file);
        //  });
        //});



        //scope.queueFiles = scope.queueFiles ? scope.queueFiles : [];
        //element.on('change', function (event) {
        //  angular.forEach(event.target.files,function(file){
        //    scope.queueFiles.push({
        //      preview:'images/loading.gif',
        //      file:file
        //    });
        //  });
        //  scope.$apply();
        //  //$log.log('queueFiles',scope.queueFiles);
        //});



        //scope.queueFiles = scope.queueFiles ? scope.queueFiles : [];
        //element.on('change', function (event) {
        //  angular.forEach(event.target.files,function(file){
        //    scope.queueFiles.push({
        //      preview:'images/loading.gif',
        //      file:file
        //    });
        //  });
        //  scope.$apply();
        //  $log.log('queueFiles',scope.queueFiles);
        //});



        //$log.log('changeEvent.target.files',event.target.files);

      }
    };
  }]);
