'use strict';

//  'ngRoute',
//  'siteConfig',
//  'angular-loading-bar',
//  'filters',
//  'validators',
//  'firebase',
//  'routes',
//  'cgBusy',
//  'jlareau.pnotify',
//  'publications',
//  'login',
//  'account',
//  'ui.bootstrap',
//  'main',
//  'updateMeta',
//  'accountPublications',
//  'trTrustpass',
//  'ngPasswordStrength',
//  'algoliasearch',
//  'images',
//  'ngMessages',
//  'angular-redactor',
//  'uuid',
//  'ngFileUpload'

angular.module('app',['ngRoute','routes','projectConfig','main'])
  .controller('AppController',['$scope',function( $scope){

      $scope.sizeOf = function(obj) {
        if (typeof obj === 'undefined'){
          obj = {};
        }
        return Object.keys(obj).length;
      };

      $scope.firstObj = function (obj) {
        for (var key in obj) if (obj.hasOwnProperty(key)) return key;
      };

    }]);