// FrontEnd Controller
angular.module('main',['cloudinary','algoliasearch','categories'])
  .controller('MainController',[
    '$scope',
    '$q',
    '$location',
    '$window',
    'algolia',
    'categoriesService',
    '$log', function( $scope, $q, $location, $window, algolia, categoriesService, $log){

      var configTasks = {};
      var client = algolia.Client('FU6V8V2Y6Q', '75b635c7c8656803b0b9e82e0510f266');
      var categories = categoriesService.nodes();
      configTasks.categories = categories.$loaded();

      //$scope.isCollapsed = true; // TODO FOR DEBUG

      var itemsPerPage = 2;
      var algoliaOriginalSettings = angular.copy($scope.algolia = {
        req : {
          query: '',
          facets:'*',
          facetFilters: [],
          // number of hits per page
          hitsPerPage: itemsPerPage,
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
          // number of publications per page
          itemsPerPage: itemsPerPage,
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
            categories:[]
          },
          // Track Faces in use
          currentFacets: {
            categories:[]
          },
          categories: {
            // add facet to main request string
            addFacet: function(facet){
              // facet : {"left":5,"name":"Real Estate","parentId":"","right":10,"$id":"-K5pzphvGtzcQhxopgpD","$priority":null,"count":1}
              $scope.algolia.faceting.currentFacets.categories = angular.isDefined($scope.algolia.faceting.currentFacets.categories) ? $scope.algolia.faceting.currentFacets.categories : [];
              $scope.algolia.faceting.currentFacets.categories.push(facet);
              $scope.algolia.req.facetFilters.push('categories:'+facet.name);
              search();
            },
            // Remove al facets
            removeAllFacet: function () {
              angular.copy([],$scope.algolia.faceting.currentFacets.categories);
              updateFacetFilters()
                .then(function(){
                  $scope.algolia.sortOrder.changeIndexName('publications');
                  search();
                });
            },
            removeFacet: function (facet,$index) {
              var currentFacets = [];
              angular.copy($scope.algolia.faceting.currentFacets.categories,currentFacets);
              angular.copy([],$scope.algolia.faceting.currentFacets.categories);
              for (var i  = 0; i <= $index; i++){
                $scope.algolia.faceting.currentFacets.categories.push(currentFacets[i]);
                if(i === $index){
                  updateFacetFilters()
                    .then(function(){
                      search();
                    });
                }
              }
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
                categoriesfacetsAvailables();
                deferred.resolve();
              }
            }, function(err){
              deferred.reject(err);
            });
        }
        startSearch();
        return deferred.promise;
      }

      function categoriesfacetsAvailables(){
        $scope.algolia.faceting.facetsAvailables.categories = [];

        // needles
        angular.forEach($scope.algolia.res.facets.categories, function (count, facetName) {

          // haystack
          angular.forEach(categories, function(categoryObj){
            if(facetName === categoryObj.name){
              // Children facets
              if(angular.isDefined($scope.algolia.faceting.currentFacets.categories) && $scope.algolia.faceting.currentFacets.categories.length > 0){
                var lastObj = $scope._($scope.algolia.faceting.currentFacets.categories)
                  .last();
                if(categoryObj.parentId === lastObj.$id){
                  categoryObj.count = count;
                  $scope.algolia.faceting.facetsAvailables.categories.push(categoryObj);
                }
              }else{
                // Root facets
                if(categoryObj.parentId === ''){
                  categoryObj.count = count;
                  $scope.algolia.faceting.facetsAvailables.categories.push(categoryObj);
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