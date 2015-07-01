'use strict';

angular.module('publications',[])
  .factory('url',['$filter',function($filter){

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
        //$log.log('searchText',searchText);
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

      var data = {
        expiredSession: false,
        products:[]
      };

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
  .directive('publications',['$templateCache','$compile',function($templateCache,$compile){

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
  }]);
