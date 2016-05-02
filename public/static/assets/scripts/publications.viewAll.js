publicationsModule
  .controller('ViewAllPublicationController',[
    '$scope',
    '$q',
    function($scope, $q){

      $scope.user = {};

      $scope.lording = {
        deferred: $q.defer(),
        isDone: false,
        promises: []
      };

      $scope.lording.promise = $scope.lording.deferred.promise;

    }]);
