'use strict';

angular.module('routes',[])
  .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

    $locationProvider.html5Mode(true).hashPrefix('!');

    $routeProvider
      .when('/', {
        templateUrl: 'static/assets/views/main.html',
        controller: 'MainController',
        reloadOnSearch: false
      })
      .otherwise({redirectTo: '/'});

  }]);
