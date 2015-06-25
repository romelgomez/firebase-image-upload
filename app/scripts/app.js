'use strict';

/**
 * @ngdoc overview
 * @name marketplaceApp:routes
 * @description
 * # routes.js
 *
 * Configure routes for use with Angular, and apply authentication security
 * Add new routes using `yo angularfire:route` with the optional --auth-required flag.
 *
 * Any controller can be secured so that it will only load if user is logged in by
 * using `whenAuthenticated()` in place of `when()`. This requires the user to
 * be logged in to view this route, and adds the current user into the dependencies
 * which can be injected into the controller. If user is not logged in, the promise is
 * rejected, which is handled below by $routeChangeError
 *
 * Any controller can be forced to wait for authentication to resolve, without necessarily
 * requiring the user to be logged in, by adding a `resolve` block similar to the one below.
 * It would then inject `user` as a dependency. This could also be done in the controller,
 * but abstracting it makes things cleaner (controllers don't need to worry about auth state
 * or timing of displaying its UI components; it can assume it is taken care of when it runs)
 *
 *   resolve: {
 *     user: ['Auth', function(Auth) {
 *       return Auth.$getAuth();
 *     }]
 *   }
 *
 */
angular.module('routes',['ngRoute'])

/**
 * Adds a special `whenAuthenticated` method onto $routeProvider. This special method,
 * when called, invokes Auth.$requireAuth() service (see Auth.js).
 *
 * The promise either resolves to the authenticated user object and makes it available to
 * dependency injection (see AccountCtrl), or rejects the promise if user is not logged in,
 * forcing a redirect to the /login page
 */
  .config(['$routeProvider', 'SECURED_ROUTES', function($routeProvider, SECURED_ROUTES) {
    // credits for this idea: https://groups.google.com/forum/#!msg/angular/dPr9BpIZID0/MgWVluo_Tg8J
    // unfortunately, a decorator cannot be use here because they are not applied until after
    // the .config calls resolve, so they can't be used during route configuration, so we have
    // to hack it directly onto the $routeProvider object
    $routeProvider.whenAuthenticated = function(path, route) {
      route.resolve = route.resolve || {};
      route.resolve.user = ['Auth', function(Auth) {
        return Auth.$requireAuth();
      }];
      $routeProvider.when(path, route);
      SECURED_ROUTES[path] = true;
      return $routeProvider;
    };
  }])

  // configure views; whenAuthenticated adds a resolve method to ensure users authenticate
  // before trying to access that route
  .config(['$routeProvider', function($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/categories', {
        templateUrl: 'views/categories.html',
        controller: 'CategoriesController'
      })
      .when('/chat', {
        templateUrl: 'views/chat.html',
        controller: 'ChatCtrl'
      })
      .when('/login', {
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl'
      })
      .whenAuthenticated('/account', {
        templateUrl: 'views/account.html',
        controller: 'AccountCtrl'
      })
      .otherwise({redirectTo: '/'});
  }])

/**
 * Apply some route security. Any route's resolve method can reject the promise with
 * "AUTH_REQUIRED" to force a redirect. This method enforces that and also watches
 * for changes in auth status which might require us to navigate away from a path
 * that we can no longer view.
 */
  .run(['$rootScope', '$location', 'Auth', 'SECURED_ROUTES', 'LOGIN_REDIRECT_PATH',
    function($rootScope, $location, Auth, SECURED_ROUTES, LOGIN_REDIRECT_PATH) {
      // watch for login status changes and redirect if appropriate
      Auth.$onAuth(check);

      // some of our routes may reject resolve promises with the special {authRequired: true} error
      // this redirects to the login page whenever that is encountered
      $rootScope.$on('$routeChangeError', function(e, next, prev, err) {
        if( err.toString() === 'AUTH_REQUIRED' ) {
          $location.path(LOGIN_REDIRECT_PATH);
        }
      });

      function check(user) {
        if( !user && authRequired($location.path()) ) {
          $location.path(LOGIN_REDIRECT_PATH);
        }
      }

      function authRequired(path) {
        return SECURED_ROUTES.hasOwnProperty(path);
      }
    }
  ])

  // used by route security
  .constant('SECURED_ROUTES', {});



/**
 * @ngdoc overview
 * @name marketplaceApp
 * @description
 * # marketplaceApp
 *
 * Main module of the application.
 */
angular.module('marketplaceApp', ['routes','ngAnimate','ngAria','ngCookies','ngMessages','ngResource','ngSanitize','firebase','fireBaseConfig','categories'])
  .controller('MainCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  })
  .controller('LoginCtrl', function ($scope, Auth, $location, $q, Ref, $timeout) {
    // Manages authentication to any active providers.

    $scope.oauthLogin = function(provider) {
      $scope.err = null;
      Auth.$authWithOAuthPopup(provider, {rememberMe: true}).then(redirect, showError);
    };

    $scope.anonymousLogin = function() {
      $scope.err = null;
      Auth.$authAnonymously({rememberMe: true}).then(redirect, showError);
    };

    $scope.passwordLogin = function(email, pass) {
      $scope.err = null;
      Auth.$authWithPassword({email: email, password: pass}, {rememberMe: true}).then(
        redirect, showError
      );
    };

    $scope.createAccount = function(email, pass, confirm) {
      $scope.err = null;
      if( !pass ) {
        $scope.err = 'Please enter a password';
      }
      else if( pass !== confirm ) {
        $scope.err = 'Passwords do not match';
      }
      else {
        Auth.$createUser({email: email, password: pass})
          .then(function () {
            // authenticate so we have permission to write to Firebase
            return Auth.$authWithPassword({email: email, password: pass}, {rememberMe: true});
          })
          .then(createProfile)
          .then(redirect, showError);
      }

      function createProfile(user) {
        var ref = Ref.child('users', user.uid), def = $q.defer();
        ref.set({email: email, name: firstPartOfEmail(email)}, function(err) {
          $timeout(function() {
            if( err ) {
              def.reject(err);
            }
            else {
              def.resolve(ref);
            }
          });
        });
        return def.promise;
      }
    };

    function firstPartOfEmail(email) {
      return ucfirst(email.substr(0, email.indexOf('@'))||'');
    }

    function ucfirst (str) {
      // inspired by: http://kevin.vanzonneveld.net
      str += '';
      var f = str.charAt(0).toUpperCase();
      return f + str.substr(1);
    }



    function redirect() {
      $location.path('/account');
    }

    function showError(err) {
      $scope.err = err;
    }


  })
  .controller('AccountCtrl', function ($scope, user, Auth, Ref, $firebaseObject, $timeout) {
    // Provides rudimentary account management functions.

    $scope.user = user;
    $scope.logout = function() { Auth.$unauth(); };
    $scope.messages = [];
    var profile = $firebaseObject(Ref.child('users/'+user.uid));
    profile.$bindTo($scope, 'profile');


    $scope.changePassword = function(oldPass, newPass, confirm) {
      $scope.err = null;
      if( !oldPass || !newPass ) {
        error('Please enter all fields');
      }
      else if( newPass !== confirm ) {
        error('Passwords do not match');
      }
      else {
        Auth.$changePassword({email: profile.email, oldPassword: oldPass, newPassword: newPass})
          .then(function() {
            success('Password changed');
          }, error);
      }
    };

    $scope.changeEmail = function(pass, newEmail) {
      $scope.err = null;
      Auth.$changeEmail({password: pass, newEmail: newEmail, oldEmail: profile.email})
        .then(function() {
          profile.email = newEmail;
          profile.$save();
          success('Email changed');
        })
        .catch(error);
    };

    function error(err) {
      alert(err, 'danger');
    }

    function success(msg) {
      alert(msg, 'success');
    }

    function alert(msg, type) {
      var obj = {text: msg+'', type: type};
      $scope.messages.unshift(obj);
      $timeout(function() {
        $scope.messages.splice($scope.messages.indexOf(obj), 1);
      }, 10000);
    }

  })
  .controller('ChatCtrl', function ($scope, Ref, $firebaseArray, $timeout) {
    // A demo of using AngularFire to manage a synchronized list.

    // synchronize a read-only, synchronized array of messages, limit to most recent 10
    $scope.messages = $firebaseArray(Ref.child('messages').limitToLast(10));

    // display any errors
    $scope.messages.$loaded().catch(alert);

    // provide a method for adding a message
    $scope.addMessage = function(newMessage) {
      if( newMessage ) {
        // push a message to the end of the array
        $scope.messages.$add({text: newMessage})
          // display any errors
          .catch(alert);
      }
    };

    function alert(msg) {
      $scope.err = msg;
      $timeout(function() {
        $scope.err = null;
      }, 5000);
    }
  })
  .filter('reverse', function() {
    return function(items) {
      return angular.isArray(items)? items.slice().reverse() : [];
    };
  });

angular.module('fireBaseConfig',[])
  .constant('FIRE_BASE_URL', 'https://berlin.firebaseio.com')
  .constant('SIMPLE_LOGIN_PROVIDERS', ['password','facebook','google','twitter','github'])
  .constant('LOGIN_REDIRECT_PATH', '/login')
  .factory('Auth', function($firebaseAuth, Ref) {
    return $firebaseAuth(Ref);
  })
  .factory('Ref', ['$window', 'FIRE_BASE_URL', function($window, FIRE_BASE_URL) {
    return new $window.Firebase(FIRE_BASE_URL);
  }])
  .directive('ngHideAuth', ['Auth', '$timeout','$log', function (Auth, $timeout, $log) {
    return {
      restrict: 'A',
      link: function(scope, el) {
        el.addClass('ng-cloak'); // hide until we process it
        function update() {
          // sometimes if ngCloak exists on same element, they argue, so make sure that
          // this one always runs last for reliability
          $timeout(function () {
            $log.log('\n ngHideAuth directive Auth.$getAuth()',Auth.$getAuth());
            $log.log('ngHideAuth directive !!Auth.$getAuth()',!!Auth.$getAuth());
            el.toggleClass('ng-cloak', !!Auth.$getAuth());
          }, 0);
        }

        Auth.$onAuth(update);
        update();
      }
    };
  }])
  .directive('ngShowAuth', ['Auth', '$timeout', '$log', function (Auth, $timeout, $log) {
    //  A directive that shows elements only when user is logged out. It also waits for Auth to be initialized so there is no initial flashing of incorrect state.
    return {
      restrict: 'A',
      link: function(scope, el) {
        el.addClass('ng-cloak'); // hide until we process it

        function update() {
          // sometimes if ngCloak exists on same element, they argue, so make sure that
          // this one always runs last for reliability
          $timeout(function () {
            $log.log('\n ngShowAuth directive Auth.$getAuth()',Auth.$getAuth());
            $log.log('ngShowAuth directive !Auth.$getAuth()',!Auth.$getAuth());
            el.toggleClass('ng-cloak', !Auth.$getAuth());
          }, 0);
        }

        Auth.$onAuth(update);
        update();
      }
    };
  }]);



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
        response: function(response){
          // I intercept successful responses.
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
        },
        responseError: function (response){
          // I intercept error responses.
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
      });

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
            if(data.status === 'success'){
              window.location = '/';
            }else{
              notificationService.error(data.message);
            }
          }).
          error(function() {
            window.location = '/';
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
            if(data.status === 'success'){

              notificationService.success('Listo, ahora intente iniciar sesión en su cuenta.');

//                            form.find('.form-group').hide();
//                            form.find('button').hide();


            }else{
              notificationService.error(data.message);
            }
          }).
          error(function() {
            window.location = '/';
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
            if(data.status === 'success'){
              notificationService.success('Ya le enviamos un correo electrónico para que recupere su cuenta.');
              $modalInstance.close();
            }else{
              notificationService.error(data.message);
            }
          }).
          error(function() {
            window.location = '/';
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
            if(data.status === 'success'){
              notificationService.success('Casi listo, le hemos enviado un correo para verificar y activar su cuenta.');
              $modalInstance.close();
            }else{
              notificationService.error(data.message);
            }
          }).
          error(function() {
            window.location = '/';
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
            if(data.status === 'success'){
              notificationService.success('Ya hemos enviado otro correo electrónico para verificar su cuenta.');
              $modalInstance.close();
            }else{
              notificationService.error(data.message);
            }
          }).
          error(function() {
            window.location = '/';
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

      var urlObj         	= {};
      urlObj.action     	= action;
      urlObj.user     	= user;
      urlObj.search      	= '';
      urlObj.page        	= '';
      urlObj.orderBy    	= '';

      if(fragments !== ''){
        var splitSegments = fragments.split('/');
        if(splitSegments.length){
          angular.forEach(splitSegments, function(parameter) {
            if(parameter.indexOf('search-') !== -1){
              var searchString 	= $filter('stringReplace')(parameter,'search-','');
              urlObj.search 		= $filter('noSpecialChars')(searchString);
            }
            if(parameter.indexOf('page-') !== -1){
              urlObj.page = parseInt($filter('stringReplace')(parameter,'page-',''));
            }
            switch(parameter) {
              case 'highest-price':
                urlObj.orderBy = 'highest-price';
                break;
              case 'lowest-price':
                urlObj.orderBy = 'lowest-price';
                break;
              case 'latest':
                urlObj.orderBy = 'latest';
                break;
              case 'oldest':
                urlObj.orderBy = 'oldest';
                break;
              case 'higher-availability':
                urlObj.orderBy = 'higher-availability';
                break;
              case 'lower-availability':
                urlObj.orderBy = 'lower-availability';
                break;
            }
          });
        }
      }

      return urlObj;
    };

    return {
      info: function () {
        return info();
      },
      page: function(page){
        var urlInfo = info();
        var slug     = '';
        var newUrl = '';

        if(urlInfo.orderBy !== ''){
          if(urlInfo.search !== ''){
            slug = $filter('slug')(urlInfo.search);
            newUrl = '#/search-'+slug+'/'+urlInfo.orderBy+'/page-'+page;
          }else{
            newUrl = '#/'+urlInfo.orderBy+'/page-'+page;
          }
        }else{
          if(urlInfo.search !== ''){
            slug = $filter('slug')(urlInfo.search);
            newUrl = '#/search-'+slug+'/page-'+page;
          }else{
            newUrl = '#/page-'+page;
          }
        }

        window.location.href = newUrl;
      },
      orderBy: function(order){
        var urlInfo = info();
        var newUrl = '';

        if(urlInfo.search !== ''){
          var slug = $filter('slug')(urlInfo.search);
          newUrl = '#/search-'+slug+'/'+order;
        }else{
          newUrl = '#/'+order;
        }
        window.location.href = newUrl;
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
              id: 		publication.product.id,
              title:		$filter('capitalizeFirstChar')(publication.product.title),
              slug:		$filter('slug')(publication.product.title),
              status:		publication.product.status,
              price:		publication.product.price,
              quantity:	publication.product.quantity,
              created:	$filter('dateParse')(publication.product.created,'dd/MM/yyyy - hh:mm a')
            };
            obj.link = '/product/'+obj.id+'/'+obj.slug+'.html';
            obj.draftLink = '/edit-draft/'+obj.id;

            if(publication.image === undefined || publication.image.length === 0){
              obj.image = '/assets/images/no-image-available.png';
            }else{
              obj.image = '/assets/images/publications/'+publication.image[0].name;
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

    //var test = {
    //  expiredSession:true
    //};


    var getPublications = function(){

      $scope.httpRequestPromise = $http.post('/products', url.info()).
        success(function(data) {
          $log.log('httpRequest data: ',data);


          if(data.expiredSession){
            window.location = '/login';
          }

          if(data.status === 'success'){

            $scope.publications 	= publications.digest(data.products);
            $scope.orderBy 			= data.orderBy;
            $scope.search 			= data.search;
            $scope.totalItems 		= data.totalItems;
            $scope.itemsInThisPage 	= data.itemsInThisPage;
            $scope.currentPage 		= data.currentPage;
            $scope.totalPages 		= data.totalPages;

          }else{
            //window.location = '/';
          }

        }).
        error(function() {
          window.location = '/';
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
            if(scope.currentPage === scope.totalPages){
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
      link:function(scope,element){

        if(typeof scope.publications ===  'undefined'){
          throw { message: 'attrs data is not defined' };
        }
        if(typeof scope.type ===  'undefined'){
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
      return (!!input) ? input.trim().replace(/(^\w?)/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1);}) : '';
    };
  })
  .filter('dateParse', function($filter) {
    return function(input,format,timezone) {
      return (!!input) ? $filter('date')( Date.parse(input), format, timezone) : '';
    };
  })
  .filter('stringReplace', function() {
    return function(string,changeThis,forThis) {
      return string.split(changeThis).join(forThis);
    };
  });

//angular.module('app',['ui.bootstrap','forms','publications','filters']);
