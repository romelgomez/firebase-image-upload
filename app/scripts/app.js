'use strict';

/**
 * @ngdoc overview
 * @name marketplaceApp
 * @description
 * # marketplaceApp
 *
 * Main module of the application.
 */
angular.module('marketplaceApp', [
    'ngAnimate',
    'ngAria',
    'ngCookies',
    'ngMessages',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'firebase',
    'firebase.ref',
    'firebase.auth'
  ]);



angular.module('categories',[])
  .controller('CategoriesController',[function(){

  }]);


angular.module('httpDelay',[])
  .config(['$httpProvider', function($httpProvider) {
    // http://www.bennadel.com/blog/2802-simulating-network-latency-in-angularjs-with-http-interceptors-and-timeout.htm

    $httpProvider.interceptors.push( httpDelay );


    // I add a delay to both successful and failed responses.
    function httpDelay( $timeout, $q ) {

      var delayInMilliseconds = 3000;

      // Return our interceptor configuration.
      return({
        response: response,
        responseError: responseError
      });


      // ---
      // PUBLIC METHODS.
      // ---


      // I intercept successful responses.
      function response( response ) {

        var deferred = $q.defer();

        $timeout(
          function() {

            deferred.resolve( response );

          },
          delayInMilliseconds,
          // There's no need to trigger a $digest - the view-model has
          // not been changed.
          false
        );

        return( deferred.promise );

      }


      // I intercept error responses.
      function responseError( response ) {

        var deferred = $q.defer();

        $timeout(
          function() {

            deferred.reject( response );

          },
          delayInMilliseconds,
          // There's no need to trigger a $digest - the view-model has
          // not been changed.
          false
        );

        return( deferred.promise );

      }

    }

  }]);

angular.module('forms',['ngMessages','cgBusy','jlareau.pnotify','validation.match'])
  .controller('FormsController',['$scope','$modal',function($scope,$modal){
    $scope.recoverAccount = function (size) {
      $modal.open({
        templateUrl: 'recoverAccountModal.html',
        controller: 'RecoverAccountController',
        size: size
      });
    };
    $scope.newUser = function (size) {
      $modal.open({
        templateUrl: 'newUserModal.html',
        controller: 'NewUserController',
        size: size
      });
    };
    $scope.verifyEmail = function(size){
      $modal.open({
        templateUrl: 'verifyEmailModal.html',
        controller: 'VerifyEmailController',
        size: size
      });
    };
  }])
  .controller('LoginFormController',['$scope','$http','notificationService',function($scope,$http,notificationService) {

    $scope.model = {
      email: null,
      password: null
    };

    $scope.submit = function(){
      if($scope.form.$valid){
        $scope.httpRequestPromise = $http.post('/in', $scope.model).
          success(function(data) {
            if(data['status'] === 'success'){
              window.location = "/";
            }else{
              notificationService.error(data.message);
            }
          }).
          error(function() {
            window.location = "/";
          });
      }
    };

  }])
  .controller('NewPasswordController',['$scope','$http','notificationService',function($scope,$http,notificationService) {

    $scope.model = {
      password: null,
      passwordAgain: null
    };

    $scope.submit = function(){
      if($scope.form.$valid){
        $scope.httpRequestPromise = $http.post('/snp', $scope.model).
          success(function(data) {
            if(data['status'] === 'success'){

              notificationService.success('Listo, ahora intente iniciar sesión en su cuenta.');

//                            form.find('.form-group').hide();
//                            form.find('button').hide();


            }else{
              notificationService.error(data.message);
            }
          }).
          error(function() {
            window.location = "/";
          });
      }
    };

  }])
  .controller('RecoverAccountController',['$scope','$http','$modalInstance','notificationService',function($scope,$http,$modalInstance,notificationService){

    $scope.model = {
      email: null
    };

    $scope.submit = function () {
      if($scope.form.$valid){
        $scope.httpRequestPromise = $http.post('/recover-account', $scope.model).
          success(function(data) {
            if(data['status'] === 'success'){
              notificationService.success('Ya le enviamos un correo electrónico para que recupere su cuenta.');
              $modalInstance.close();
            }else{
              notificationService.error(data.message);
            }
          }).
          error(function() {
            window.location = "/";
          });
      }
    };

    $scope.cancel = function () {
      $modalInstance.dismiss();
    };

  }])
  .controller('NewUserController',['$scope','$http','$modalInstance','notificationService',function($scope,$http,$modalInstance,notificationService){

    $scope.model = {
      name: null,
      email: null,
      lastName: null,
      password: null,
      termsOfService: false
    };

    $scope.submit = function () {
      if($scope.form.$valid){
        $scope.httpRequestPromise = $http.post('/new-user', $scope.model).
          success(function(data) {
            if(data['status'] === 'success'){
              notificationService.success('Casi listo, le hemos enviado un correo para verificar y activar su cuenta.');
              $modalInstance.close();
            }else{
              notificationService.error(data.message);
            }
          }).
          error(function() {
            window.location = "/";
          });
      }
    };

    $scope.cancel = function () {
      $modalInstance.dismiss();
    };

  }])
  .controller('VerifyEmailController',['$scope','$http','$modalInstance','notificationService',function($scope,$http,$modalInstance,notificationService){

    $scope.model = {
      email: null
    };

    $scope.submit = function () {
      if($scope.form.$valid){
        $scope.httpRequestPromise = $http.post('/sea', $scope.model).
          success(function(data) {
            if(data['status'] === 'success'){
              notificationService.success('Ya hemos enviado otro correo electrónico para verificar su cuenta.');
              $modalInstance.close();
            }else{
              notificationService.error(data.message);
            }
          }).
          error(function() {
            window.location = "/";
          });
      }
    };

    $scope.cancel = function () {
      $modalInstance.dismiss();
    };

  }]);

angular.module('publications',[])
  .factory('url',['$filter','$log',function($filter,$log){

    var info = function () {
      var href 		= window.URI(window.location.href); // window.URI($location.absUrl())
      var action   	= href.segment(0);
      var user   		= href.segment(1);
      var fragments 	= href.fragment(); // $location.path();

      var url_obj         	= {};
      url_obj['action']     	= action;
      url_obj['user']     	= user;
      url_obj['search']      	= '';
      url_obj['page']        	= '';
      url_obj['orderBy']    	= '';

      if(fragments != ''){
        var splitSegments = fragments.split('/');
        if(splitSegments.length){
          angular.forEach(splitSegments, function(parameter) {
            if(parameter.indexOf("search-") !== -1){
              var search_string 	= $filter('stringReplace')(parameter,'search-','');
              url_obj.search 		= $filter('noSpecialChars')(search_string);
            }
            if(parameter.indexOf("page-") !== -1){
              url_obj.page = parseInt($filter('stringReplace')(parameter,'page-',''));
            }
            switch(parameter) {
              case 'highest-price':
                url_obj['orderBy'] = "highest-price";
                break;
              case 'lowest-price':
                url_obj['orderBy'] = "lowest-price";
                break;
              case 'latest':
                url_obj['orderBy'] = "latest";
                break;
              case 'oldest':
                url_obj['orderBy'] = 'oldest';
                break;
              case 'higher-availability':
                url_obj['orderBy'] = 'higher-availability';
                break;
              case 'lower-availability':
                url_obj['orderBy'] = 'lower-availability';
                break;
            }
          });
        }
      }

      return url_obj;
    };

    return {
      info: function () {
        return info();
      },
      page: function(page){
        var urlInfo = info();
        var slug     = '';
        var new_url = '';

        if(urlInfo['orderBy'] != ''){
          if(urlInfo['search'] !== ''){
            slug = $filter('slug')(urlInfo['search']);
            new_url = '#/search-'+slug+'/'+urlInfo['orderBy']+'/page-'+page;
          }else{
            new_url = '#/'+urlInfo['orderBy']+'/page-'+page;
          }
        }else{
          if(urlInfo['search'] !== ''){
            slug = $filter('slug')(urlInfo['search']);
            new_url = "#/search-"+slug+"/page-"+page;
          }else{
            new_url = "#/page-"+page;
          }
        }

        window.location.href = new_url;
      },
      orderBy: function(order){
        var urlInfo = info();
        var new_url = '';

        if(urlInfo['search'] !== ''){
          var slug = $filter('slug')(urlInfo['search']);
          new_url = '#/search-'+slug+'/'+order;
        }else{
          new_url = '#/'+order;
        }
        window.location.href = new_url;
      },
      search:function(searchText){
        $log.log('searchText',searchText);
        var slug = $filter('slug')(searchText);
        window.location.href = '#/search-'+slug;
      }
    };

  }])
  .factory('publications',function($filter){

    return {
      digest:function(list){
        var publications = [];
        if(list.length > 0){
          angular.forEach(list,function(publication){
            var obj = {
              id: 		publication['Product']['id'],
              title:		$filter('capitalizeFirstChar')(publication['Product']['title']),
              slug:		$filter('slug')(publication['Product']['title']),
              status:		publication['Product']['status'],
              price:		publication['Product']['price'],
              quantity:	publication['Product']['quantity'],
              created:	$filter('dateParse')(publication['Product']['created'],'dd/MM/yyyy - hh:mm a')
            };
            obj.link = '/product/'+obj.id+'/'+obj.slug+'.html';
            obj.draftLink = '/edit-draft/'+obj.id;

            if(publication['Image'] == undefined || publication['Image'].length == 0){
              obj.image = '/assets/images/no-image-available.png'
            }else{
              obj.image = '/assets/images/publications/'+publication['Image'][0]['name'];
            }
            publications.push(obj);
          });
        }
        return publications;
      }
    };

  })
  .controller('PublicationsController',['$scope','$http','notificationService','url','$filter','publications','$log',function($scope,$http,notificationService,url,$filter,publications,$log){

    $scope.publications = [];
    $scope.orderBy = '';

    var getPublications = function(){

      $scope.httpRequestPromise = $http.post('/products', url.info()).
        success(function(data) {
          $log.log('httpRequest data: ',data);

          if(data['expired_session']){
            window.location = "/login";
          }

          if(data['status'] === 'success'){

            $scope.publications 	= publications.digest(data['products']);
            $scope.orderBy 			= data['orderBy'];
            $scope.search 			= data['search'];
            $scope.totalItems 		= data['totalItems'];
            $scope.itemsInThisPage 	= data['itemsInThisPage'];
            $scope.currentPage 		= data['currentPage'];
            $scope.totalPages 		= data['totalPages'];

          }else{
            //window.location = "/";
          }

        }).
        error(function() {
          window.location = "/";
        });
    };

    $scope.submit = function () {
      if($scope.form.$valid){
        // set new url
        url.search($scope.search);
        // request again the publications
        getPublications();
      }
    };

    $scope.orderChanged = function(order){
      // set new url
      url.orderBy(order);
      // request again the publications
      getPublications();
    };

    $scope.pageChanged = function() {
      // set new url
      url.page($scope.currentPage);
      // request again the publications
      getPublications();
    };

    getPublications();

  }])
  .directive('paginationInfo',[function(){

    return {
      restrict:'E',
      scope: {
        'items':'=',
        'totalItems':'=',
        'itemsInThisPage':'=',
        'totalPages':'=',
        'currentPage':'='
      },
      template:'<div><span ng-if="totalItems == 1">1 publication</span><span ng-if="totalItems == 0">0 publications</span><span ng-if="totalItems > 1"><b>{{info.de}}</b> - <b>{{info.hasta}}</b> of <b>{{totalItems}}</b> publications</span></div>',
      replace:true,
      link:function(scope){

        scope.$watch('items', function(){
          if(scope.totalItems > 1){
            var de = '';
            var hasta = '';
            if(scope.currentPage == scope.totalPages){
              de 		= scope.totalItems-scope.itemsInThisPage+1;
              hasta	= scope.totalItems;
            }
            if(scope.currentPage < scope.totalPages){
              de 		= (scope.currentPage*scope.itemsInThisPage)-scope.itemsInThisPage+1;
              hasta	= scope.currentPage*scope.itemsInThisPage;
            }
            scope.info = {
              'de':de,
              'hasta':hasta
            };
          }
        });

      }
    };

  }])
  .directive('publications',['$log','$templateCache','$compile',function($log,$templateCache,$compile){

    return {
      restrict:'E',
      scope: {
        'publications':'=data',
        'type':'@'
      },
      link:function(scope,element,attrs){

        if(typeof scope.publications ==  "undefined"){
          throw { message: 'attrs data is not defined' };
        }
        if(typeof scope.type ==  "undefined"){
          throw { message: 'attrs type is not defined' };
        }

        scope.$watch('publications', function(){

          var template = '';

          switch(scope.type) {
            case 'published':
              if(scope.publications.length > 0){
                template = 'published.html';
              }else{
                template = 'noPublished.html';
              }
              break;
            case 'stock':
              if(scope.publications.length > 0){
                template = 'stock.html';
              }else{
                template = 'noStock.html';
              }
              break;
          }

          element.html($compile($templateCache.get(template))(scope));

        });

      }
    };
  }])
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

angular.module('filters',[])
  .filter('capitalize', function() {
    return function(input) {
      return (!!input) ? input.replace(/([^\W_]+[^\s-]*) */g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}) : '';
    };
  })
  .filter('slug', function() {
    return function(input) {
      return (!!input) ? String(input).replace(/[^a-zá-źA-ZÁ-Ź0-9]/g, ' ').trim().replace(/\s{2,}/g, ' ').replace(/\s+/g, '-') : '';  //  http://www.regexr.com/
    };
  })
  .filter('noSpecialChars', function() {
    return function(input) {
      return (!!input) ? String(input).replace(/[^a-zá-źA-ZÁ-Ź0-9]/g, ' ').trim().replace(/\s{2,}/g, ' ') : '';  //  http://www.regexr.com/
    };
  })
  .filter('capitalizeFirstChar', function() {
    return function(input) {
      return (!!input) ? input.trim().replace(/(^\w{0,1})/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1);}) : '';
    };
  })
  .filter('dateParse', function($filter) {
    return function(input,format,timezone) {
      return (!!input) ? $filter('date')( Date.parse(input), format, timezone) : '';
    };
  })
  .filter('stringReplace', function() {
    return function(string,change_this,for_this) {
      return string.split(change_this).join(for_this);
    };
  });

//angular.module('app',['ui.bootstrap','forms','publications','filters']);
