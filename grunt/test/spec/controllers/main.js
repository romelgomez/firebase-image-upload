'use strict';

describe('Controller: MainCtrl', function () {

  // load the controller's module
  beforeEach(module('main'));

  var MainCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MainCtrl = $controller('MainController', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});


describe('Test filters', function () {
  var $filter;

  beforeEach(function () {
    module('filters');

    inject(function (_$filter_) {
      $filter = _$filter_;
    });
  });

  it('All first letters of each word should be capital letters', function () {
    // Arrange.
    var testText = 'hello word', result;
    // Act.
    result = $filter('capitalize')(testText);
    // Assert.
    expect(result).toEqual('Hello Word');
  });

  it('All letters should be downCased and spaces and specialChars are replaced by hyphens \'-\'', function () {
    // Arrange.
    var testText = 'Hello ·· Word', result;
    // Act.
    result = $filter('slug')(testText);
    // Assert.
    expect(result).toEqual('hello-word');
  });

  it('All special chars should be replaced by white spaces, and only one space should be exist between words', function () {
    // Arrange.
    var testText = 'Hello #@#~½~¬½~¬~½@#@ word ()/()()(/$""·$"¿? .', result;
    // Act.
    result = $filter('noSpecialChars')(testText);
    // Assert.
    expect(result).toEqual('Hello word');
  });

  it('Should be capitalize the first Char', function () {
    // Arrange.
    var testText = 'hello word', result;
    // Act.
    result = $filter('capitalizeFirstChar')(testText);
    // Assert.
    expect(result).toEqual('Hello word');
  });

});
