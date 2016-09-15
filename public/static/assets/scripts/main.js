angular.module('main',[])
  .controller('MainController',['$scope', '$q',function($scope, $q){

    $scope.lording = {
      deferred: $q.defer(),
      isDone: false,
      promises: []
    };

    $scope.lording.promise = $scope.lording.deferred.promise;

  }])
  .controller('SimpleViewsController',['$scope', 'SITE_URL', 'SITE_TITLE',function($scope, SITE_URL, SITE_TITLE){
    $scope.SITE_URL = SITE_URL;
    $scope.SITE_TITLE = SITE_TITLE;
  }]);