publicationsModule
  .directive('listPublications',[
    '$q',
    '$location',
    '$window',
    'algolia',
    'FireRef',
    'FireAuth',
    '$firebaseArray',
    '$firebaseObject',
    '$route',
    '$routeParams',
    'notificationService',
    '$filter',
    '$uibModal',
    'CATEGORIES',
    'LOCATIONS',
    'CATEGORIES_ROUTE_PARAMETERS',
    'LOCATIONS_ROUTE_PARAMETERS',
    function($q, $location, $window, algolia, FireRef , FireAuth, $firebaseArray, $firebaseObject, $route, $routeParams, notificationService, $filter, $uibModal, CATEGORIES, LOCATIONS, CATEGORIES_ROUTE_PARAMETERS, LOCATIONS_ROUTE_PARAMETERS){
      return {
        restrict:'E',
        templateUrl: 'static/assets/views/directives/publicationsList.html',
        scope:{
          profile:'=?',
          editMode:'=?',
          lording:'=',
          account:'=?',
          submit:'=?',
          publications:'=?'
        },
        link : function($scope) {

          $scope.profile  = typeof $scope.profile !== 'undefined' ? $scope.profile : {};
          $scope.editMode = typeof $scope.editMode !== 'undefined' ? $scope.editMode : false;

          $scope.sizeOf = function(obj) {
            if (typeof obj === 'undefined'){
              obj = {};
            }
            return Object.keys(obj).length;
          };

          $scope.firstObj = function (obj) {
            for (var key in obj) if (obj.hasOwnProperty(key)) return key;
          };

          if(typeof $scope.lording === 'undefined'){
            $scope.lording = {
              deferred: $q.defer(),
              isDone: false,
              promises: []
            };

            $scope.lording.promise = $scope.lording.deferred.promise;
          }

          var client = algolia.Client('FU6V8V2Y6Q', '75b635c7c8656803b0b9e82e0510f266');

          var allFacets = {
            categories: CATEGORIES,
            locations: LOCATIONS
          };


          //  jobSalaryType:[],
          //  reHomeStatus:[],
          //  reHomeFor:[],
          //  jobHasBenefits:[],
          //  jobHasBonus:[]

          var routeParameters = {
            categories: CATEGORIES_ROUTE_PARAMETERS,
            locations: LOCATIONS_ROUTE_PARAMETERS,
            sortOrder: {
              'price-asc': 'publications_by_price_asc',
              'price-desc': 'publications_by_price_desc',
              'salary-desc': 'publications_by_salary_desc',
              'salary-asc': 'publications_by_salary_asc',
              'release-date-desc': 'publications_by_releaseDate_desc',
              'release-date-asc': 'publications_by_releaseDate_asc'
            },
            customFacets: {
              'job-type': {
                 'permanent': true,
                 'contract': true
              },
              'job-recruiter-type': {
                'agency':true,
                'direct-employer':true
              }
            }
          };

          $scope.algolia = {
            isReady: false,
            req : {
              query: '',
              facets:'*',
              typoTolerance:false,
              facetFilters: [],
              // number of hits per page
              hitsPerPage: 7,
              getRankingInfo: 1,
              // current page number
              page: 0,
              highlightPreTag: '<b>',
              highlightPostTag: '</b>'
            },
            // The response object that we get after make a http request
            res: {},
            // configuration relate to the pagination
            pagination: {
              // number of pages that are visible
              maxSize: 10,
              // current page
              currentPage : 1,
              pageChanged : function() {
                $scope.algolia.req.page = $scope.algolia.pagination.currentPage-1;
                search();
              }
            },
            // configuration relate to sort order
            sortOrder:{
              currentIndexName: 'publications',
              changeIndexName: function(indexName){
                $scope.algolia.sortOrder.currentIndexName = indexName;
              },
              sortBy:function(){
                $scope.algolia.req.page = 0;
                $scope.algolia.pagination.currentPage = 1;
                search();
              },
              options:{
                'Marketplace': [
                  {
                    title:'Relevance',
                    indexName:'publications',
                    slug: null
                  },
                  {
                    title:'Low prices publications',
                    indexName:'publications_by_price_asc',
                    slug: 'price-asc'
                  },
                  {
                    title:'Highest prices publications',
                    indexName:'publications_by_price_desc',
                    slug: 'price-desc'
                  },
                  {
                    title:'Latest publications',
                    indexName:'publications_by_releaseDate_desc',
                    slug: 'release-date-desc'
                  },
                  {
                    title:'Old publications',
                    indexName:'publications_by_releaseDate_asc',
                    slug: 'release-date-asc'
                  }
                ],
                'Jobs':[
                  {
                    title:'Relevance',
                    indexName:'publications',
                    slug: null
                  },
                  {
                    title:'Highest salary publications',
                    indexName:'publications_by_salary_desc',
                    slug: 'salary-desc'
                  },
                  {
                    title:'Low salary publications',
                    indexName:'publications_by_salary_asc',
                    slug: 'salary-asc'
                  },
                  {
                    title:'Latest publications',
                    indexName:'publications_by_releaseDate_desc',
                    slug: 'release-date-desc'
                  },
                  {
                    title:'Old publications',
                    indexName:'publications_by_releaseDate_asc',
                    slug: 'release-date-asc'
                  }
                ],
                'Real Estate':[
                  {
                    title:'Relevance',
                    indexName:'publications',
                    slug: null
                  },
                  {
                    title:'Low prices publications',
                    indexName:'publications_by_price_asc',
                    slug: 'price-asc'
                  },
                  {
                    title:'Highest prices publications',
                    indexName:'publications_by_price_desc',
                    slug: 'price-desc'
                  },
                  {
                    title:'Latest publications',
                    indexName:'publications_by_releaseDate_desc',
                    slug: 'release-date-desc'
                  },
                  {
                    title:'Old publications',
                    indexName:'publications_by_releaseDate_asc',
                    slug: 'release-date-asc'
                  }
                ],
                'Transport':[
                  {
                    title:'Relevance',
                    indexName:'publications',
                    slug: null
                  },
                  {
                    title:'Low prices publications',
                    indexName:'publications_by_price_asc',
                    slug: 'price-asc'
                  },
                  {
                    title:'Highest prices publications',
                    indexName:'publications_by_price_desc',
                    slug: 'price-desc'
                  },
                  {
                    title:'Latest publications',
                    indexName:'publications_by_releaseDate_desc',
                    slug: 'release-date-desc'
                  },
                  {
                    title:'Old publications',
                    indexName:'publications_by_releaseDate_asc',
                    slug: 'release-date-asc'
                  }
                ],
                'Services':[
                  {
                    title:'Relevance',
                    indexName:'publications',
                    slug: null
                  },
                  {
                    title:'Latest publications',
                    indexName:'publications_by_releaseDate_desc',
                    slug: 'release-date-desc'
                  },
                  {
                    title:'Old publications',
                    indexName:'publications_by_releaseDate_asc',
                    slug: 'release-date-asc'
                  }
                ]
              }
            },
            // configuration relate to faceting
            faceting: {
              // Availables facets that we can select
              facetsAvailables : {
                userID:[],
                categories:[],
                locations:[],
                jobType:[],
                jobRecruiterType:[],
                jobSalaryType:[],
                reHomeStatus:[],
                reHomeFor:[],
                jobHasBenefits:[],
                jobHasBonus:[]
              },
              // Track Faces in use
              currentFacets: {
                userID:[],
                categories:[],
                locations:[],
                jobType:[],
                jobRecruiterType:[],
                jobSalaryType:[],
                reHomeStatus:[],
                reHomeFor:[],
                jobHasBenefits:[],
                jobHasBonus:[]
              },
              treeFacetsMethods: {
                // add facet to main request string
                addFacet: function(facetType,facet, _search_){
                  console.log('facet', facet);
                  // facet : {"left":5,"name":"Real Estate","parentId":"","right":10,"$id":"-K5pzphvGtzcQhxopgpD","$priority":null,"count":1}
                  $scope.algolia.faceting.currentFacets[facetType] = angular.isDefined($scope.algolia.faceting.currentFacets[facetType]) ? $scope.algolia.faceting.currentFacets[facetType] : [];
                  $scope.algolia.faceting.currentFacets[facetType].push(facet);
                  $scope.algolia.req.facetFilters.push(facetType+':'+facet.name);

                  if(typeof _search_ !== 'undefined' && _search_ === true){
                    search();
                  }
                },
                // Remove al facets
                removeAllFacet: function (facetType) {
                  $scope.algolia.req.page = 0;
                  $scope.algolia.pagination.currentPage = 1;

                  angular.copy([],$scope.algolia.faceting.currentFacets[facetType]);

                  if(facetType === 'categories'){
                    // Marketplace
                    // Real Estate
                    angular.copy([],$scope.algolia.faceting.currentFacets['reHomeStatus']);
                    angular.copy([],$scope.algolia.faceting.currentFacets['reHomeFor']);
                    // Transport
                    // Services
                    // Jobs
                    angular.copy([],$scope.algolia.faceting.currentFacets['jobType']);
                    angular.copy([],$scope.algolia.faceting.currentFacets['jobSalaryType']);
                    angular.copy([],$scope.algolia.faceting.currentFacets['jobRecruiterType']);
                    angular.copy([],$scope.algolia.faceting.currentFacets['jobHasBenefits']);
                    angular.copy([],$scope.algolia.faceting.currentFacets['jobHasBonus']);
                  }

                  updateFacetFilters()
                    .then(function(){
                      $scope.algolia.sortOrder.changeIndexName('publications');
                      search();
                    });
                },
                removeFacet: function (facetType, facet, $index) {
                  var currentFacets = [];
                  angular.copy($scope.algolia.faceting.currentFacets[facetType],currentFacets);
                  angular.copy([],$scope.algolia.faceting.currentFacets[facetType]);
                  for (var i  = 0; i <= $index; i++){
                    $scope.algolia.faceting.currentFacets[facetType].push(currentFacets[i]);
                    if(i === $index){
                      updateFacetFilters()
                        .then(function(){
                          search();
                        });
                    }
                  }
                }
              },
              facetsMethods: {
                // add facet to main request string
                addFacet: function(facetType, facetName, _search_){
                  console.log('facetType', facetType);
                  console.log('facetName', facetName);

                  // facet : {"left":5,"name":"Real Estate","parentId":"","right":10,"$id":"-K5pzphvGtzcQhxopgpD","$priority":null,"count":1}
                  var facetObj = {};
                  facetObj.name = facetName; // to match the requirements of updateFacetFilters function
                  $scope.algolia.faceting.currentFacets[facetType] = angular.isDefined($scope.algolia.faceting.currentFacets[facetType]) ? $scope.algolia.faceting.currentFacets[facetType] : [];
                  $scope.algolia.faceting.currentFacets[facetType].push(facetObj);
                  $scope.algolia.req.facetFilters.push(facetType+':'+facetObj.name);

                  if(typeof _search_ !== 'undefined' && _search_ === true){
                    search();
                  }
                },
                removeFacet: function (facetType) {
                  angular.copy([],$scope.algolia.faceting.currentFacets[facetType]);
                  updateFacetFilters()
                    .then(function(){
                      $scope.algolia.sortOrder.changeIndexName('publications');
                      search();
                    });
                }
              }
            }
          };

          function updateFacetFilters (){
            var deferred   = $q.defer();
            var currentFacetsLength  = $window.Object.keys($scope.algolia.faceting.currentFacets).length;
            var count = 0;
            $scope.algolia.req.facetFilters = [];
            angular.forEach($scope.algolia.faceting.currentFacets, function(facets, attrName){
              if(facets.length > 0){
                angular.forEach(facets, function(facet){
                  $scope.algolia.req.facetFilters.push(attrName+':'+facet.name)
                })
              }
              count++;
              if(currentFacetsLength === count){
                deferred.resolve();
              }
            });
            return deferred.promise;
          }

          function search (){
            // accountPublications.js
            if(typeof $scope.publications !== 'undefined'){
              $scope.publications.more = false;
              $scope.publications.setCount($scope.profile.publicationsCount, true);
            }

            var deferred   = $q.defer();
            var index  = client.initIndex($scope.algolia.sortOrder.currentIndexName);
            function startSearch (){
              index.search($scope.algolia.req)
                .then(function(res) {
                  if(res.query !== $scope.algolia.req.query){
                    startSearch();
                  }else{
                    $scope.algolia.res = res;
                    treefacetsAvailables('categories');
                    treefacetsAvailables('locations');
                    deferred.resolve();
                  }
                }, function(err){
                  deferred.reject(err);
                });
            }
            startSearch();
            return deferred.promise;
          }

          function treefacetsAvailables(facetType){
            $scope.algolia.faceting.facetsAvailables[facetType] = [];

            // needles
            angular.forEach($scope.algolia.res.facets[facetType], function (count, facetName) {

              // haystack
              angular.forEach(allFacets[facetType], function(facet){
                if(facetName === facet.name){
                  // Children facets
                  if(angular.isDefined($scope.algolia.faceting.currentFacets[facetType]) && $scope.algolia.faceting.currentFacets[facetType].length > 0){
                    var lastFacet = $window._.last($scope.algolia.faceting.currentFacets[facetType]);
                    if(facet.parentId === lastFacet.$id){
                      facet.count = count;
                      $scope.algolia.faceting.facetsAvailables[facetType].push(facet);
                    }
                  }else{
                    // Root facets
                    if(facet.parentId === ''){
                      facet.count = count;
                      $scope.algolia.faceting.facetsAvailables[facetType].push(facet);
                    }
                  }
                }
              });
            });
          }


          /** Los diferentes parametros de busqueda
           *  facetas
           *   categorías
           *   locaciones
           *   personalizadas
           *
           *  índice
           *
           *  pagina
           *
           *  búsqueda
           */


          /**
           * @Description  set all query to default.
           * @return {Undefined}
           * */
          function resetQuerySettings (){
            $scope.algolia.sortOrder.changeIndexName('publications');
            angular.copy({},$scope.algolia.faceting.currentFacets);
            $scope.algolia.req.facetFilters = [];
            $scope.algolia.req.page = 0;
            $scope.algolia.pagination.currentPage = 1;

            var facetName = '';
            if(typeof $scope.account !== 'undefined'){
              facetName = $scope.account.user.uid;
            }

            if(typeof $scope.profile.$id !== 'undefined'){
              facetName = $scope.profile.$id;
            }

            if(facetName !== ''){
              $scope.algolia.faceting.facetsMethods.addFacet('userID', facetName, false);
            }
          }

          $scope.submit = function(){

            resetQuerySettings();

            parseURL()
              .then(null,function(err){
                notificationService.error(err);
              })
          };

          $scope._parseURL = function(){
            console.log('$location.search()', $location.search());

            var searchObj = $location.search();

            console.log('typeof searchObj.c', typeof searchObj.c);
            console.log('typeof searchObj.l', typeof searchObj.l);
            console.log('routeParameters.locations(searchObj.l)', routeParameters.locations[searchObj.l]);

            //$location.search({c: ['jobs', 'mecanico']})
            //$location.search({c: ['jobs', 'mecanico', 'doctor']})
            //$location.search({c: ['jobs', 'mecanico']})
          };

          var parsedURL = '';

          /*

          Al principo la URL se refleja en el estado interno,
          luego el estado interno se refleja en la url.


           */

          function parseURL (_searchObj_) {
            //var deferred   = $q.defer();

            //var searchObj = typeof _searchObj_ !== 'undefined' ? _searchObj_ : $location.search();
            if(parsedURL === ''){
              parsedURL = true;
              // URL se refleja en el estado interno.

              var searchObj = $location.search();
              //var

              // Categories
              switch(typeof searchObj.c) {
                case 'string':
                  // Search facet in routeParameters.categories
                  if(typeof routeParameters.categories[searchObj.c] !== 'undefined'){
                    $scope.algolia.faceting.treeFacetsMethods.addFacet('categories', routeParameters.categories[searchObj.c], false);
                  }
                  break;
                case 'object':
                  // Search facets in routeParameters.categories
                  angular.forEach(searchObj.c, function (slugfacetName) {
                    if(typeof routeParameters.categories[slugfacetName] !== 'undefined'){
                      $scope.algolia.faceting.treeFacetsMethods.addFacet('categories', routeParameters.categories[slugfacetName], false);
                    }
                  });
                  break;
              }

              // Locations
              switch(typeof searchObj.l) {
                case 'string':
                  // Search facet in routeParameters.categories
                  if(typeof routeParameters.categories[searchObj.l] !== 'undefined'){
                    $scope.algolia.faceting.treeFacetsMethods.addFacet('categories', routeParameters.categories[searchObj.c], false);
                  }
                  break;
                case 'object':
                  // Search facets in routeParameters.categories
                  angular.forEach(searchObj.l, function (slugfacetName) {
                    if(typeof routeParameters.categories[slugfacetName] !== 'undefined'){
                      $scope.algolia.faceting.treeFacetsMethods.addFacet('categories', routeParameters.categories[slugfacetName], false);
                    }
                  });
                  break;
              }

              // Custom Facets
                //  jobType:[],
                //  jobRecruiterType:[],
                //  jobSalaryType:[],
                //  reHomeStatus:[],
                //  reHomeFor:[],
                //  jobHasBenefits:[],
                //  jobHasBonus:[]

              // index or sortOrder

              // search string

              // page

            }else{
              // estado interno se refleja en la url

            }

            return search();
          }

          /**
           * MAIN FUNCTION
           */
          $q.all($scope.lording.promises)
            .then(function () {

              // parse the URL, then > parsedURL: true

              $scope.$watch(function(){
                return $scope.algolia.req.query;
              },function(){

                /*
                 * if parsedURL is undefined
                 *   parse url, then, parsedURL: true, and search
                 * else
                 *   reset facets, index, and query string; set new url that represent the current state, and search
                 *   resetQuerySettings
                 * */

                resetQuerySettings();

                parseURL()
                  .then(function(){

                    if($scope.lording.isDone === false){
                      $scope.lording.deferred.resolve();
                      $scope.lording.isDone = true;
                    }

                  },function(err){
                    notificationService.error(err);
                  })


              });

            }, function(){
              notificationService.error('This action cannot be completed.');
              $location.path('/');
            });

          $scope.viewPublication = function (publicationId) {
            $location.path('/view-publication/'+publicationId);
          };

          $scope.editPublication = function (publicationId) {
            $location.path('/edit-publication/'+publicationId);
          };

          $scope.responsiveFilters = function(size){
            if($scope.algolia.res.nbHits > 0 ){
              var modalInstance = $uibModal.open({
                templateUrl: 'responsiveFiltersModal.html',
                controller: 'ResponsiveFiltersController',
                size: size,
                resolve: {
                  algolia: function () {
                    return $scope.algolia;
                  }
                }
              });

              modalInstance.result.then(function () {
                //notificationService.success('');
              }, function (error) {
                //modalErrors(error);
              });

            }
          };

        }
      };
    }])
  .controller('ResponsiveFiltersController',[ '$scope', '$uibModalInstance', 'algolia' ,function($scope, $uibModalInstance, algolia){

    $scope.algolia = algolia;

    $scope.sizeOf = function(obj) {
      if (typeof obj === 'undefined'){
        obj = {};
      }
      return Object.keys(obj).length;
    };

    $scope.firstObj = function (obj) {
      for (var key in obj) if (obj.hasOwnProperty(key)) return key;
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss();
    };

  }]);


// TODO ADD support TO deep link urls
//console.log('$routeParams', $routeParams);
//if($scope.algolia.req.query !== ''){
//  //$route.updateParams({'q':$scope.algolia.req.query});
//  $location.search('q', $scope.algolia.req.query);
//}

//$route.updateParams({'c':null});

// Categories
//if(typeof $routeParams.c !== 'undefined'){
//
//  switch(typeof $routeParams.c) {
//    case 'object':
//
//      break;
//    case 'string':
//
//      var facetName = '';
//
//      switch($routeParams.c) {
//        case 'jobs':
//          facetName = 'Jobs';
//          break;
//        case 'transport':
//          facetName = 'Transport';
//          break;
//        case 'marketplace':
//          facetName = 'Marketplace';
//          break;
//        case 'real-estate':
//          facetName = 'Real Estate';
//          break;
//        case 'services':
//          facetName = 'Services';
//          break;
//      }
//
//      $scope.algolia.faceting.treeFacetsMethods.addFacet('categories',{
//        name: facetName,
//        parentId: ''
//      }, true);
//
//      break;
//  }
//}

