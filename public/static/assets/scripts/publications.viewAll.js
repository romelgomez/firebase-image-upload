publicationsModule
  .controller('ViewAllPublicationController',[
    '$scope',
    '$q',
    function($scope, $q){

      $scope.lording = {
        deferred: $q.defer(),
        isDone: false,
        taskToDoFirst:[]
      };

      $scope.lording.promise = $scope.lording.deferred.promise;


    }]);
