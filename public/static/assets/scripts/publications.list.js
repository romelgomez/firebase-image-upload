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
                parseURL();
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
                parseURL();
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
                addFacet: function(facetType, facet, _search_){
                  //console.log('facet', facet);
                  // facet : {"left":5,"name":"Real Estate","parentId":"","right":10,"$id":"-K5pzphvGtzcQhxopgpD","$priority":null,"count":1}

                  //console.log('$scope.algolia.faceting.currentFacets[facetType]', $scope.algolia.faceting.currentFacets[facetType]);

                  $scope.algolia.faceting.currentFacets[facetType] = angular.isDefined($scope.algolia.faceting.currentFacets[facetType]) ? $scope.algolia.faceting.currentFacets[facetType] : [];
                  $scope.algolia.faceting.currentFacets[facetType].push(facet);
                  $scope.algolia.req.facetFilters.push(facetType+':'+facet.name);

                  //console.log('$scope.algolia.faceting.currentFacets[facetType]', $scope.algolia.faceting.currentFacets[facetType]);


                  if(typeof _search_ !== 'undefined' && _search_ === true){
                    parseURL();
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
                      parseURL();
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
                          parseURL();
                        });
                    }
                  }
                }
              },
              facetsMethods: {
                // add facet to main request string
                addFacet: function(facetType, facetName, _search_){
                  //console.log('facetType', facetType);
                  //console.log('facetName', facetName);

                  // facet : {"left":5,"name":"Real Estate","parentId":"","right":10,"$id":"-K5pzphvGtzcQhxopgpD","$priority":null,"count":1}
                  var facetObj = {};
                  facetObj.name = facetName; // to match the requirements of updateFacetFilters function
                  //console.log('$scope.algolia.faceting.currentFacets[facetType]', $scope.algolia.faceting.currentFacets[facetType]);
                  $scope.algolia.faceting.currentFacets[facetType] = angular.isDefined($scope.algolia.faceting.currentFacets[facetType]) ? $scope.algolia.faceting.currentFacets[facetType] : [];
                  $scope.algolia.faceting.currentFacets[facetType].push(facetObj);
                  $scope.algolia.req.facetFilters.push(facetType+':'+facetObj.name);

                  //console.log('$scope.algolia.faceting.currentFacets[facetType]', $scope.algolia.faceting.currentFacets[facetType]);


                  if(typeof _search_ !== 'undefined' && _search_ === true){
                    parseURL();
                  }
                },
                removeFacet: function (facetType) {
                  angular.copy([],$scope.algolia.faceting.currentFacets[facetType]);
                  updateFacetFilters()
                    .then(function(){
                      $scope.algolia.sortOrder.changeIndexName('publications');
                      parseURL();
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
                  if((res.query !== $scope.algolia.req.query) || (res.hits.length === 0 && res.nbHits > 0)){
                    if((res.hits.length === 0 && res.nbHits > 0)){
                      $scope.algolia.req.page = res.nbPages - 1;
                      $scope.algolia.pagination.currentPage = res.nbPages;
                      $scope.algolia.pagination.currentPage2 = res.nbPages;

                      var currentURLState = getCurrentURLState({
                        'c':'categories',
                        'l':'locations',
                        'job-type':'jobType',
                        'job-recruiter-type':'jobRecruiterType',
                        'job-salary-type':'jobSalaryType',
                        'job-has-benefits':'jobHasBenefits',
                        'job-has-bonus':'jobHasBonus',
                        're-home-status':'reHomeStatus',
                        're-home-for':'reHomeFor'
                      });
                      currentURLState.page = res.nbPages;
                      $location.search(currentURLState);

                      //$scope.currentURLState.page = res.nbPages;
                      //$location.search($scope.currentURLState);
                      startSearch();
                    }else{
                      startSearch();
                    }
                  }else{
                    //console.log('this never hapen');
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

            //console.log('$scope.algolia.res.facets[facetType]', $scope.algolia.res.facets[facetType])
            //console.log('facetType', facetType)

            // needles
            angular.forEach($scope.algolia.res.facets[facetType], function (count, facetName) {

              // haystack

              //console.log('allFacets[facetType]', allFacets[facetType])
              angular.forEach(allFacets[facetType], function(facet){
                if(facetName === facet.name){

                  //console.log('facet', facet);
                  //console.log('angular.isDefined($scope.algolia.faceting.currentFacets[facetType])', angular.isDefined($scope.algolia.faceting.currentFacets[facetType]));
                  //console.log('$scope.algolia.faceting.currentFacets[facetType].length > 0', $scope.algolia.faceting.currentFacets[facetType].length > 0);
                  //console.log('angular.isDefined($scope.algolia.faceting.currentFacets[facetType])', angular.isDefined($scope.algolia.faceting.currentFacets[facetType]));
                  //console.log('*********************************************************************************************************************************');

                  // Children facets
                  if(angular.isDefined($scope.algolia.faceting.currentFacets[facetType]) && $scope.algolia.faceting.currentFacets[facetType].length > 0){
                    var lastFacet = $window._.last($scope.algolia.faceting.currentFacets[facetType]);
                    //console.log('lastFacet',lastFacet)
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


            //console.log('$scope.algolia.faceting.facetsAvailables[facetType]', $scope.algolia.faceting.facetsAvailables[facetType]);
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
            console.log('typeof searchObj[\'page\']', typeof searchObj['page']);
            console.log('typeof searchObj[\'job-type\']', typeof searchObj['job-type']);
            console.log('typeof searchObj[\'job-has-bonus\']', typeof searchObj['job-has-bonus']);
            console.log('routeParameters.locations(searchObj.l)', routeParameters.locations[searchObj.l]);

            //$location.search({c: ['jobs', 'mecanico']})
            //$location.search({c: ['jobs', 'mecanico', 'doctor']})
            //$location.search({c: ['jobs', 'mecanico']})
          };


          function getCurrentURLState(facetsNames){
            var currentURLState = {};

            // facets
            angular.forEach(facetsNames, function (facetName, facetNameIdentifier) {

              var facets = [];
              angular.forEach($scope.algolia.faceting.currentFacets[facetName], function (facet) {
                facets.push($filter('slug')(facet.name));
              });

              if(facets.length > 0){
                currentURLState[facetNameIdentifier] = facets;
              }else{
                currentURLState[facetNameIdentifier] = null;
              }

            });

            // Index or sortOrder
            switch($scope.algolia.sortOrder.currentIndexName) {
              case 'publications_by_price_asc':
                currentURLState.i = 'price-asc';
                break;
              case 'publications_by_price_desc':
                currentURLState.i = 'price-desc';
                break;
              case 'publications_by_salary_desc':
                currentURLState.i = 'salary-desc';
                break;
              case 'publications_by_salary_asc':
                currentURLState.i = 'salary-asc';
                break;
              case 'publications_by_releaseDate_desc':
                currentURLState.i = 'release-date-desc';
                break;
              case 'publications_by_releaseDate_asc':
                currentURLState.i = 'release-date-asc';
                break;
              default:
                currentURLState.i = null;
            }

            // Page
            if($scope.algolia.req.page > 0){
              currentURLState.page = $scope.algolia.req.page + 1;
            }else{
              currentURLState.page = null;
            }

            // Query string
            if($scope.algolia.req.query !== ''){
              currentURLState.q = $filter('slug')($scope.algolia.req.query);
            }else{
              currentURLState.q = null;
            }

            //console.log('currentURLState', currentURLState);
            return currentURLState;
          }


          var parsedURL = '';

          /*

          Al principo la URL se refleja en el estado interno,
          luego el estado interno se refleja en la url.


           */

          function parseURL () {
            if(parsedURL === ''){
              parsedURL = true;
              // URL se refleja en el estado interno.
              //console.log('URL se refleja en el estado interno.')

              var searchObj = $location.search();
              //console.log('searchObj', searchObj);

              var facet;

              // Categories
              switch(typeof searchObj.c) {
                case 'string':
                  // Search facet in routeParameters.categories
                  if(typeof routeParameters.categories[searchObj.c] !== 'undefined'){
                    //console.log('routeParameters.categories[searchObj.c]', routeParameters.categories[searchObj.c]);

                    facet = routeParameters.categories[searchObj.c];
                    facet.$id = facet.nodeID;

                    $scope.algolia.faceting.treeFacetsMethods.addFacet('categories', facet, false);
                  }
                  break;
                case 'object':
                  // Search facets in routeParameters.categories
                  angular.forEach(searchObj.c, function (slugfacetName) {
                    if(typeof routeParameters.categories[slugfacetName] !== 'undefined'){

                      facet = routeParameters.categories[slugfacetName];
                      facet.$id = facet.nodeID;

                      $scope.algolia.faceting.treeFacetsMethods.addFacet('categories', facet, false);
                    }
                  });
                  break;
              }

              // Locations
              switch(typeof searchObj.l) {
                case 'string':
                  // Search facet in routeParameters.categories
                  if(typeof routeParameters.locations[searchObj.l] !== 'undefined'){

                    facet = routeParameters.locations[searchObj.l];
                    facet.$id = facet.nodeID;

                    $scope.algolia.faceting.treeFacetsMethods.addFacet('locations', facet, false);
                  }
                  break;
                case 'object':
                  // Search facets in routeParameters.categories
                  angular.forEach(searchObj.l, function (slugfacetName) {
                    if(typeof routeParameters.locations[slugfacetName] !== 'undefined'){

                      facet = routeParameters.locations[slugfacetName];
                      facet.$id = facet.nodeID;

                      $scope.algolia.faceting.treeFacetsMethods.addFacet('locations', facet, false);
                    }
                  });
                  break;
              }

              // Custom Facets
              if(typeof searchObj['job-type'] === 'string'){
                switch(searchObj['job-type']) {
                  case 'permanent':
                    $scope.algolia.faceting.facetsMethods.addFacet('jobType', 'Permanent', false);
                    break;
                  case 'contract':
                    $scope.algolia.faceting.facetsMethods.addFacet('jobType', 'Contract', false);
                    break;
                }
              }

              if(typeof searchObj['job-recruiter-type'] === 'string'){
                switch(searchObj['job-recruiter-type']) {
                  case 'agency':
                    $scope.algolia.faceting.facetsMethods.addFacet('jobRecruiterType', 'Agency', false);
                    break;
                  case 'direct-employer':
                    $scope.algolia.faceting.facetsMethods.addFacet('jobRecruiterType', 'Direct Employer', false);
                    break;
                }
              }

              if(typeof searchObj['job-salary-type'] === 'string'){
                switch(searchObj['job-salary-type']) {
                  case 'annual':
                    $scope.algolia.faceting.facetsMethods.addFacet('jobSalaryType', 'Annual', false);
                    break;
                  case 'daily':
                    $scope.algolia.faceting.facetsMethods.addFacet('jobSalaryType', 'Daily', false);
                    break;
                  case 'hourly':
                    $scope.algolia.faceting.facetsMethods.addFacet('jobSalaryType', 'Hourly', false);
                    break;
                }
              }

              if(typeof searchObj['job-has-benefits'] === 'string'){
                switch(searchObj['job-has-benefits']) {
                  case 'true':
                    $scope.algolia.faceting.facetsMethods.addFacet('jobHasBenefits', true, false);
                    break;
                }
              }

              if(typeof searchObj['job-has-bonus'] === 'string'){
                switch(searchObj['job-has-bonus']) {
                  case 'true':
                    $scope.algolia.faceting.facetsMethods.addFacet('jobHasBonus', true, false);
                    break;
                }
              }

              if(typeof searchObj['re-home-status'] === 'string'){
                switch(searchObj['re-home-status']) {
                  case 'new':
                    $scope.algolia.faceting.facetsMethods.addFacet('reHomeStatus', 'New', false);
                    break;
                  case 'refurbished':
                    $scope.algolia.faceting.facetsMethods.addFacet('reHomeStatus', 'Refurbished', false);
                    break;
                  case 'used':
                    $scope.algolia.faceting.facetsMethods.addFacet('reHomeStatus', 'Used', false);
                    break;
                }
              }

              // Index or sortOrder
              if(typeof searchObj.i === 'string'){
                switch(searchObj.i) {
                  case 'price-asc':
                    $scope.algolia.sortOrder.changeIndexName('publications_by_price_asc');
                    break;
                  case 'price-desc':
                    $scope.algolia.sortOrder.changeIndexName('publications_by_price_desc');
                    break;
                  case 'salary-desc':
                    $scope.algolia.sortOrder.changeIndexName('publications_by_salary_desc');
                    break;
                  case 'salary-asc':
                    $scope.algolia.sortOrder.changeIndexName('publications_by_salary_asc');
                    break;
                  case 'release-date-desc':
                    $scope.algolia.sortOrder.changeIndexName('publications_by_releaseDate_desc');
                    break;
                  case 'release-date-asc':
                    $scope.algolia.sortOrder.changeIndexName('publications_by_releaseDate_asc');
                    break;
                  default:
                    $scope.algolia.sortOrder.changeIndexName('publications');
                }
              }

              // Page
              if(typeof searchObj.page === 'string'){
                var page = parseInt(searchObj.page);
                if(!isNaN(page) && page > 0){
                  $scope.algolia.req.page = page - 1;
                  $scope.algolia.pagination.currentPage = page;
                  // TODO 999 At first the loading parseURL function set currentPage to the correct value, but the pagination directive fuck everything, setting to default value, and I have set this ugly fix.
                  $scope.algolia.pagination.currentPage2 = page;
                }
              }

            } else {
              // estado interno se refleja en la url
              //console.log('estado interno se refleja en la url');
              //$location.search()
              //var currentURLState = {};

              // {"left":5,"name":"Real Estate","parentId":"","right":10,"$id":"-K5pzphvGtzcQhxopgpD","$priority":null,"count":1}
              //$location.search({c: ['jobs', 'mecanico', 'doctor']})

              //// Categories
              //var categoriesFacets = [];
              //angular.forEach($scope.algolia.faceting.currentFacets.categories, function (facet) {
              //  //currentURLState
              //  categoriesFacets.push($filter('slug')(facet.name));
              //});
              //
              //// Locations
              //var locationsFacets = [];
              //angular.forEach($scope.algolia.faceting.currentFacets.locations, function (facet) {
              //  //currentURLState
              //  locationsFacets.push($filter('slug')(facet.name));
              //});
              //
              //var jobTypeFacets = [];
              //angular.forEach($scope.algolia.faceting.currentFacets.jobType, function (facet) {
              //  //currentURLState
              //  jobTypeFacets.push($filter('slug')(facet.name));
              //});
              //
              //var jobRecruiterTypeFacets = [];
              //angular.forEach($scope.algolia.faceting.currentFacets.jobRecruiterType, function (facet) {
              //  //currentURLState
              //  jobRecruiterTypeFacets.push($filter('slug')(facet.name));
              //});
              //
              //var jobSalaryTypeFacets = [];
              //angular.forEach($scope.algolia.faceting.currentFacets.jobSalaryType, function (facet) {
              //  //currentURLState
              //  jobSalaryTypeFacets.push($filter('slug')(facet.name));
              //});
              //
              //var jobHasBenefitsFacets = [];
              //angular.forEach($scope.algolia.faceting.currentFacets.jobHasBenefits, function (facet) {
              //  //currentURLState
              //  jobHasBenefitsFacets.push($filter('slug')(facet.name));
              //});


              /*
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
              */

              $location.search(getCurrentURLState({
                'c':'categories',
                'l':'locations',
                'job-type':'jobType',
                'job-recruiter-type':'jobRecruiterType',
                'job-salary-type':'jobSalaryType',
                'job-has-benefits':'jobHasBenefits',
                'job-has-bonus':'jobHasBonus',
                're-home-status':'reHomeStatus',
                're-home-for':'reHomeFor'
              }));

            }

            return search();
          }

          /**
           * MAIN FUNCTION
           */
          $q.all($scope.lording.promises)
            .then(function () {

              // We need call this before set the watcher in the search query string
              var searchObj = $location.search();
              if(typeof searchObj.q === 'string'){
                $scope.algolia.req.query = searchObj.q;
                //$scope.algolia.req.query = $filter('noSpecialChars')(searchObj.search)
              }

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

                    // TODO 999 At first the loading parseURL function set currentPage to the correct value, but the pagination directive fuck everything, setting to default value, and I have set this ugly fix.
                    if(typeof $scope.algolia.pagination.currentPage2 !== 'undefined'){
                      $scope.algolia.pagination.currentPage = $scope.algolia.pagination.currentPage2;
                      delete $scope.algolia.pagination.currentPage2;
                    }

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

