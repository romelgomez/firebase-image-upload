// FrontEnd Controller
angular.module('main',[])
  .controller('MainController',['$scope','$q',function( $scope, $q){

    $scope.lording = {
      deferred: $q.defer(),
      isDone: false,
      taskToDoFirst:{}
    };

    $scope.lording.promise = $scope.lording.deferred.promise;


  }])
  .directive('inputFocus',[function(){
    return {
      restrict:'A',
      link : function(scope, element) {
        element.focus();
      }
    };
  }]);