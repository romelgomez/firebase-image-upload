// FrontEnd Controller
angular.module('main',[])
  .controller('MainController',['$scope', '$q',function($scope, $q){

    $scope.lording = {
      deferred: $q.defer(),
      isDone: false,
      promises: []
    };

    $scope.lording.promise = $scope.lording.deferred.promise;


  }])
  .controller('FeaturesController',[function(){}])
  .controller('ContactUsController',[function(){}]);