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
    var testText = 'Your best days are not behind you; your best days are out in front of you.', result;
    // Act.
    result = $filter('capitalize')(testText);
    // Assert.
    expect(result).toEqual('Your Best Days Are Not Behind You; Your Best Days Are Out In Front Of You.');
  });

  it('All letters should be downCased and spaces and specialChars are replaced by hyphens \'-\'', function () {
    // Arrange.
    var testText = 'Your best days are not behind you; your best days are out in front of you.', result;
    // Act.
    result = $filter('slug')(testText);
    // Assert.
    expect(result).toEqual('your-best-days-are-not-behind-you-your-best-days-are-out-in-front-of-you');
  });

  it('All special chars should be replaced by white spaces, and only one space should be exist between words', function () {
    // Arrange.
    var testText = 'Your ~#~#~ ł@€@ł @łðßæðæßð best days are not ðß æßðæ æßðð  ðæßð æß  ðæßð æbehind you; your best days are out in front of you.', result;
    // Act.
    result = $filter('noSpecialChars')(testText);
    // Assert.
    expect(result).toEqual('Your best days are not behind you; your best days are out in front of you.');
  });

});
