'use strict';

/**
 * @Description A collection of validators that are applied whenever the model value changes.
 * The key value within the object refers to the name of the validator while the function refers
 * to the validation operation. The validation operation is provided with the model value as an argument
 * and must return a true or false value depending on the response of that validation.
 * @source https://docs.angularjs.org/api/ng/type/ngModel.NgModelController
 * */
angular.module('validators',[])
  .directive('noSpecialChars', function() {
    return {
      restrict:'A',
      require : 'ngModel',
      link : function(scope, element, attrs, ngModel) {
        ngModel.$validators.noSpecialChars = function(input) {
          // a false return value indicates an error
          return (String(input).match(/[^a-zá-źA-ZÁ-Ź0-9\s]/g)) ? false : true;
        };
      }
    };
  });
