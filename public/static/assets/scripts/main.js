angular.module('main',[])
  .controller('MainController',['$scope', '$q', 'SITE_TITLE',function($scope, $q, SITE_TITLE){
    $scope.SITE_TITLE = SITE_TITLE;

    $scope.lording = {
      deferred: $q.defer(),
      isDone: false,
      promises: []
    };

    $scope.lording.promise = $scope.lording.deferred.promise;

  }])
  .controller('EmptyController',[function(){
  }]);