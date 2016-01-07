// FrontEnd Controller
angular.module('main',['cloudinary','algoliasearch','categories'])
  .controller('MainController',[
    '$scope',
    '$q',
    '$location',
    'algolia',
    'categoriesService',
    '$log', function( $scope, $q, $location, algolia, categoriesService, $log){

      var configTasks = {};
      var client = algolia.Client('FU6V8V2Y6Q', '75b635c7c8656803b0b9e82e0510f266');
      var index  = client.initIndex('publications');
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
        // configuration relate to faceting
        faceting: {
          // Availables facets that we can select
          facetsAvailables : [],
          // Track Faces in use
          currentFacets: [],
          // add facet to main request string
          addFacet: function(facet){
            // {"left":5,"name":"Real Estate","parentId":"","right":10,"$id":"-K5pzphvGtzcQhxopgpD","$priority":null,"count":1}

            $scope.algolia.faceting.currentFacets.push(facet);
            $scope.algolia.req.facetFilters.push('categories:'+facet.name);
            search();
          },
          // Todo remove the exclusivity of categories
          removeFacet: function (facet,index) {
            $scope.algolia.req.facetFilters = [];
            var currentFacets = $scope.algolia.faceting.currentFacets;
            $scope.algolia.faceting.currentFacets = [];
            for (var i  = 0; i <= index; i++){
              $scope.algolia.req.facetFilters.push('categories:'+currentFacets[i].name);
              $scope.algolia.faceting.currentFacets.push(currentFacets[i]);
              if(i === index){
                search();
              }
            }
          },
          // Remove al facets
          removeAllFacet: function () {
            angular.copy([],$scope.algolia.faceting.currentFacets);
            $scope.algolia.req.facetFilters = [];
            search();
          }
        }
      });

      function search (){
        var deferred   = $q.defer();
        function startSearch (){
          index.search($scope.algolia.req)
            .then(function(res) {
              if(res.query !== $scope.algolia.req.query){
                startSearch();
              }else{
                $scope.algolia.res = res;
                setFacetedSearchMenu();
                deferred.resolve();
              }
            }, function(err){
              deferred.reject(err);
            });
        }
        startSearch();
        return deferred.promise;
      }

      /**
       * TODO This function is very relate to categories faceting, should be Rename.
       * This function set the faceted menu after the request is made
       * @return {Undefined}
       */
      function setFacetedSearchMenu(){
        $scope.algolia.faceting.facetsAvailables = [];

        // needles
        angular.forEach($scope.algolia.res.facets.categories, function (count, facetName) {

          // haystack
          angular.forEach(categories, function(categoryObj){
            if(facetName === categoryObj.name){
              // Children facets
              if($scope.algolia.faceting.currentFacets.length > 0){
                var lastObj = $scope._($scope.algolia.faceting.currentFacets)
                  .last();
                if(categoryObj.parentId === lastObj.$id){
                  categoryObj.count = count;
                  $scope.algolia.faceting.facetsAvailables.push(categoryObj);
                }
              }else{
                // Root facets
                if(categoryObj.parentId === ''){
                  categoryObj.count = count;
                  $scope.algolia.faceting.facetsAvailables.push(categoryObj);
                }
              }
            }
          });
        });

      }

      $scope.submit = function(){
        $scope.algolia.req.page = 0;
        $scope.algolia.pagination.currentPage = 1;
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
            angular.copy([],$scope.algolia.faceting.currentFacets);
            $scope.algolia.req.facetFilters = [];
            $scope.algolia.req.page = 0;
            $scope.algolia.pagination.currentPage = 1;
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