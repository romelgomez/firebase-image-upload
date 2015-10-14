'use strict';

angular.module('app',[
        'filters',
        'validators',
        'firebase',
        'fire',
        'routes',
        'tree',
        'publications',
        'login',
        'account',
        'ui.bootstrap',
        'fileUpload'
    ])
    .controller('AppController',['$scope','FireAuth',function($scope,FireAuth){

        $scope.logout = function() { FireAuth.$unauth(); };

        $scope.inProduction = false;

  }]);

