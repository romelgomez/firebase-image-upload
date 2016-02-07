// FrontEnd Controller
angular.module('main',['cloudinary','algoliasearch'])
  .controller('MainController',[
    '$scope',
    '$q',
    '$location',
    '$window',
    'algolia',
    'FireRef',
    '$firebaseArray',
    '$log', function( $scope, $q, $location, $window, algolia, FireRef , $firebaseArray, $log){

      var configTasks = {};
      var client = algolia.Client('FU6V8V2Y6Q', '75b635c7c8656803b0b9e82e0510f266');

      var fireData = {
        categories: $firebaseArray(FireRef.child('categories').orderByChild('left')),
        locations: $firebaseArray(FireRef.child('locations').orderByChild('left'))
      };

      configTasks.categories = fireData.categories.$loaded();
      configTasks.locations = fireData.locations.$loaded();

      //$scope.isCollapsed = true; // TODO FOR DEBUG

      var algoliaOriginalSettings = angular.copy($scope.algolia = {
        req : {
          query: '',
          facets:'*',
          facetFilters: [],
          // number of hits per page
          hitsPerPage: 2,
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
            search();
          },
          options:{
            'Marketplace': [
              {
                title:'Relevance',
                indexName:'publications'
              },
              {
                title:'Low prices publications',
                indexName:'publications_by_price_asc'
              },
              {
                title:'Highest prices publications',
                indexName:'publications_by_price_desc'
              },
              {
                title:'Latest publications',
                indexName:'publications_by_releaseDate_desc'
              },
              {
                title:'Old publications',
                indexName:'publications_by_releaseDate_asc'
              }
            ],
            'Jobs':[
              {
                title:'Relevance',
                indexName:'publications'
              },
              {
                title:'Highest salary publications',
                indexName:'publications_by_salary_desc'
              },
              {
                title:'Low salary publications',
                indexName:'publications_by_salary_asc'
              },
              {
                title:'Latest publications',
                indexName:'publications_by_releaseDate_desc'
              },
              {
                title:'Old publications',
                indexName:'publications_by_releaseDate_asc'
              }
            ],
            'Real Estate':[
              {
                title:'Relevance',
                indexName:'publications'
              },
              {
                title:'Low prices publications',
                indexName:'publications_by_price_asc'
              },
              {
                title:'Highest prices publications',
                indexName:'publications_by_price_desc'
              },
              {
                title:'Latest publications',
                indexName:'publications_by_releaseDate_desc'
              },
              {
                title:'Old publications',
                indexName:'publications_by_releaseDate_asc'
              }
            ],
            'Transport':[
              {
                title:'Relevance',
                indexName:'publications'
              },
              {
                title:'Low prices publications',
                indexName:'publications_by_price_asc'
              },
              {
                title:'Highest prices publications',
                indexName:'publications_by_price_desc'
              },
              {
                title:'Latest publications',
                indexName:'publications_by_releaseDate_desc'
              },
              {
                title:'Old publications',
                indexName:'publications_by_releaseDate_asc'
              }
            ],
            'Services':[
              {
                title:'Relevance',
                indexName:'publications'
              },
              {
                title:'Latest publications',
                indexName:'publications_by_releaseDate_desc'
              },
              {
                title:'Old publications',
                indexName:'publications_by_releaseDate_asc'
              }
            ]
          }
        },
        // configuration relate to faceting
        faceting: {
          // Availables facets that we can select
          facetsAvailables : {
            categories:[],
            locations:[],
            jobType:[],
            jobRecruiterType:[],
            jobSalaryType:[],
            reHomeStatus:[]
          },
          // Track Faces in use
          currentFacets: {
            categories:[],
            locations:[],
            jobType:[],
            jobRecruiterType:[],
            jobSalaryType:[],
            reHomeStatus:[]
          },
          treeFacetsMethods: {
            // add facet to main request string
            addFacet: function(facetType,facet){
              // facet : {"left":5,"name":"Real Estate","parentId":"","right":10,"$id":"-K5pzphvGtzcQhxopgpD","$priority":null,"count":1}
              $scope.algolia.faceting.currentFacets[facetType] = angular.isDefined($scope.algolia.faceting.currentFacets[facetType]) ? $scope.algolia.faceting.currentFacets[facetType] : [];
              $scope.algolia.faceting.currentFacets[facetType].push(facet);
              $scope.algolia.req.facetFilters.push(facetType+':'+facet.name);
              search();
            },
            // Remove al facets
            removeAllFacet: function (facetType) {
              angular.copy([],$scope.algolia.faceting.currentFacets[facetType]);

              if(facetType === 'categories'){
                // Marketplace
                // Real Estate
                angular.copy([],$scope.algolia.faceting.currentFacets['reHomeStatus']);
                // Transport
                // Services
                // Jobs
                angular.copy([],$scope.algolia.faceting.currentFacets['jobType']);
                angular.copy([],$scope.algolia.faceting.currentFacets['jobSalaryType']);
                angular.copy([],$scope.algolia.faceting.currentFacets['jobRecruiterType']);
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
            addFacet: function(facetType,facetName){
              // facet : {"left":5,"name":"Real Estate","parentId":"","right":10,"$id":"-K5pzphvGtzcQhxopgpD","$priority":null,"count":1}
              var facetObj = {};
              facetObj.name = facetName; // to match the requirements of updateFacetFilters function
              $scope.algolia.faceting.currentFacets[facetType] = angular.isDefined($scope.algolia.faceting.currentFacets[facetType]) ? $scope.algolia.faceting.currentFacets[facetType] : [];
              $scope.algolia.faceting.currentFacets[facetType].push(facetObj);
              $scope.algolia.req.facetFilters.push(facetType+':'+facetObj.name);
              search();
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
      });

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
          angular.forEach(fireData[facetType], function(categoryObj){
            if(facetName === categoryObj.name){
              // Children facets
              if(angular.isDefined($scope.algolia.faceting.currentFacets[facetType]) && $scope.algolia.faceting.currentFacets[facetType].length > 0){
                var lastObj = $scope._($scope.algolia.faceting.currentFacets[facetType])
                  .last();
                if(categoryObj.parentId === lastObj.$id){
                  categoryObj.count = count;
                  $scope.algolia.faceting.facetsAvailables[facetType].push(categoryObj);
                }
              }else{
                // Root facets
                if(categoryObj.parentId === ''){
                  categoryObj.count = count;
                  $scope.algolia.faceting.facetsAvailables[facetType].push(categoryObj);
                }
              }
            }
          });
        });
      }

      function resetQuerySettings (){
        $scope.algolia.sortOrder.changeIndexName('publications');
        angular.copy({},$scope.algolia.faceting.currentFacets);
        $scope.algolia.req.facetFilters = [];
        $scope.algolia.req.page = 0;
        $scope.algolia.pagination.currentPage = 1;
      }

      $scope.submit = function(){
        resetQuerySettings();
        search()
          .then(null,function(err){
            notificationService.error(err);
          })
      };

      var deferred   = $q.defer();
      $scope.httpRequestPromise = deferred.promise;

      $q.all(configTasks)
        .then(function () {

          $scope.$watch(function(){
            return $scope.algolia.req.query;
          },function(){
            resetQuerySettings();
            search()
              .then(null,function(err){
                notificationService.error(err);
              })
          });

        })
        .then(function(){
          $scope.thePublicationsAreReady = true;
          deferred.resolve();
        });

      $scope.viewPublication = function (publicationId) {
        $location.path('/view-publication/'+publicationId);
      };


    }])
  .directive('inputFocus',[function(){
    return {
      restrict:'A',
      link : function(scope, element) {
        element.focus();
      }
    };
  }]);