// https://developer.mozilla.org/en-US/docs/Using_files_from_web_applications
// https://developer.mozilla.org/en-US/docs/Web/API/FileReader
// https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL

angular.module('ngUpload',[])
  .directive('ngUpload', ['$q','$window','$log',function ($q,$window,$log) {

    var controller = function ($scope){

      $scope.readFiles = function(file){
        $log.log('file',file);

        var deferred = $q.defer();
        var promise = deferred.promise;

        var reader  = new FileReader();
        reader.readAsDataURL(file);

        reader.onloadend = function () {
          $log.log('reader.result',reader.result);
          deferred.resolve(reader.result);
        };

        return promise;
      };

      $scope.someFunction = function(){
        $log.log('someFunction is called');
        $log.log('scope.queue',$scope.queue);
      };

      var queue = [];

      $scope.queueFiles = function(files){
        angular.forEach(files,function(file){
          queue.push(file);
        });
        $log.log('queue',queue);
      };

    };

    return {
      restrict: 'E',
      templateUrl: 'ngUpload.html',
      scope: {},
      controller:controller,
      link: function(scope, element) {

        scope.queue = [];
        element.on('change', function (event) {
          angular.forEach(event.target.files,function(file){
            scope.queue.push(file);
          });
          $log.log('scope.queue',scope.queue);
        });

        //element.on('change')

        //scope.$watch(function(scope) { return scope.queue; },
        //  function() {
        //  }
        //);

        //$log.log('changeEvent.target.files',event.target.files);

      }
    };
  }]);
