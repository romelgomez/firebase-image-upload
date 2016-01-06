// FrontEnd Controller
angular.module('main',[])
  .controller('MainController',['$scope',function($scope){

    $scope.algolia = {
      query:''
    }


  }])
  .directive('inputFocus',[function(){
    return {
      restrict:'A',
      link : function(scope, element) {
        element.focus();
      }
    };
  }]);