'use strict';

angular.module('app',[
        'filters',
        'validators',
        'firebase',
        'fire',
        'routes',
        'categories',
        'publications',
        'login',
        'account',
        'ui.bootstrap',
        'main',
        'angular-underscore'
    ])
    .controller('AppController',['$scope','FireAuth',function($scope,FireAuth){

      $scope.logout = function() { FireAuth.$unauth(); };

      $scope.inProduction = false;

      $scope.sizeOf = function(obj) {
        return Object.keys(obj).length;
      };

      $scope.firstObj = function (obj) {
        for (var key in obj) if (obj.hasOwnProperty(key)) return key;
      };

  }]);

