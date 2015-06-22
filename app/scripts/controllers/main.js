'use strict';

/**
 * @ngdoc function
 * @name marketplaceApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the marketplaceApp
 */
angular.module('marketplaceApp')
  .controller('MainCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
