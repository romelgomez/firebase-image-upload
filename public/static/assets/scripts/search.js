// FrontEnd Controller
angular.module('search',[])
  .controller('SearchController',['$scope','$q',function( $scope, $q){

    $scope.lording = {
      deferred: $q.defer(),
      isDone: false,
      promises: []
    };

    $scope.lording.promise = $scope.lording.deferred.promise;

  }]);