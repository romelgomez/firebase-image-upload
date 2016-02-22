// FrontEnd Controller
angular.module('main',[])
  .controller('MainController',[function($scope){
    // ...
  }])
  .directive('inputFocus',[function(){
    return {
      restrict:'A',
      link : function(scope, element) {
        element.focus();
      }
    };
  }]);