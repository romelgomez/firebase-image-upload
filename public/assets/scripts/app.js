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
        'main'
    ])
    .controller('AppController',['$scope','FireAuth',function($scope,FireAuth){

        $scope.logout = function() { FireAuth.$unauth(); };

        $scope.inProduction = false;

  }]);

