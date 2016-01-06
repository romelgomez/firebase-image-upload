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

      //$scope.scanner = {
      //  options: {
      //    onComplete: function(event, paremeter_0){
      //      console.log('onComplete event', event);
      //      console.log('onComplete event', paremeter_0);
      //    },
      //    onError: function(event){
      //      console.log('onError event', event);
      //    },
      //    onReceive: function(event, paremeter_0){
      //      console.log('onReceive event',event);
      //      console.log('onReceive paremeter_0',paremeter_0);
      //    },
      //    timeBeforeScanTest: 100,
      //    avgTimeByChar: 30,
      //    minLength: 6,
      //    endChar: [9, 13],
      //    startChar: [],
      //    scanButtonKeyCode: false,
      //    scanButtonLongPressThreshold: 3,
      //    onScanButtonLongPressed: function(event){
      //      console.log('onScanButtonLongPressed event', event);
      //    }
      //  }
      //};



    }]);

