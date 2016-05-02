publicationsModule
  .directive('listPublications',[
    '$q',
    '$location',
    '$window',
    'algolia',
    'FireRef',
    '$firebaseArray',
    '$firebaseObject',
    '$routeParams',
    'notificationService',
    '$filter',function($q, $location, $window, algolia, FireRef , $firebaseArray, $firebaseObject, $routeParams, notificationService, $filter){
      return {
        restrict:'E',
        templateUrl: 'static/assets/views/directives/publicationsList.html',
        scope:{
          user:'=',
          profile:'=',
          editMode:'=',
          lording:'=',
          account:'='
        },
        link : function($scope) {

          $scope.user     = typeof $scope.user !== 'undefined' ? $scope.user : {};
          $scope.profile  = typeof $scope.profile !== 'undefined' ? $scope.profile : false;
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

          var fireData = {
            categories: {},
            locations: {}
          };

          // Create a synchronized array, and then destroy the synchronization after having the data
          var categories = $firebaseArray(FireRef.child('categories').orderByChild('left'));
          var categoriesLoadedPromise = categories.$loaded()
            .then(function () {
              fireData.categories = angular.copy(categories);
              categories.$destroy();
            });
          $scope.lording.promises.push(categoriesLoadedPromise);

          // Create a synchronized array, and then destroy the synchronization after having the data
          var locations = $firebaseArray(FireRef.child('locations').orderByChild('left'));
          var locationsLoadedPromise = locations.$loaded()
            .then(function () {
              fireData.locations = angular.copy(locations);
              locations.$destroy();
            });
          $scope.lording.promises.push(locationsLoadedPromise);

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
                addFacet: function(facetType,facet){
                  // facet : {"left":5,"name":"Real Estate","parentId":"","right":10,"$id":"-K5pzphvGtzcQhxopgpD","$priority":null,"count":1}
                  $scope.algolia.faceting.currentFacets[facetType] = angular.isDefined($scope.algolia.faceting.currentFacets[facetType]) ? $scope.algolia.faceting.currentFacets[facetType] : [];
                  $scope.algolia.faceting.currentFacets[facetType].push(facet);
                  $scope.algolia.req.facetFilters.push(facetType+':'+facet.name);
                  search();
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

          function loadUser(userID) {
            var deferred   = $q.defer();

            var usersRef  = FireRef.child('users');
            var userRef   = usersRef.child(userID);
            var user      = $firebaseObject(userRef);

            user.$loaded(function(){
              if (typeof user.provider === 'undefined'){
                deferred.reject();
              }  else {
                deferred.resolve({user:user});
              }
            }, function (error) {
              deferred.reject(error);
            });
            return deferred.promise;
          }

          $scope.submit = function(){
            resetQuerySettings();
            search()
              .then(null,function(err){
                notificationService.error(err);
              })
          };

          //var deferred   = $q.defer();
          //$scope.httpRequestPromise = deferred.promise;

          //$scope.lordingPromise = $scope.lording.promise;

          if (typeof $routeParams.userID !== 'undefined'){

            var loadUserPromise = loadUser($routeParams.userID)
              .then(function(the){
                $scope.user = the.user;
                $scope.user.profileBanners = [];
                $scope.user.profileImages = [];

                /*
                 banners
                 profileBanners
                 featuredBannerId
                 */

                angular.forEach(the.user.banners, function(imageData,imageID){
                  imageData.$id = imageID;
                  if(imageID !== the.user.featuredBannerId){
                    $scope.user.profileBanners.push(imageData);
                  }else{
                    $scope.user.profileBanners.unshift(imageData)
                  }
                });

                /*
                 images
                 profileImages
                 featuredImageId
                 */

                angular.forEach(the.user.images, function(imageData,imageID){
                  imageData.$id = imageID;
                  if(imageID !== the.user.featuredImageId){
                    $scope.user.profileImages.push(imageData);
                  }else{
                    $scope.user.profileImages.unshift(imageData)
                  }
                });

                $scope.user.profileImage = ($scope.user.profileImages.length > 0) ? 'https://res.cloudinary.com/berlin/image/upload/c_fill,h_200,w_200/' + $scope.user.profileImages[0].$id + '.jpg' : 'static/assets/images/uk.jpg';

              });
            $scope.lording.promises.push(loadUserPromise);
          }

          $q.all($scope.lording.promises)
            .then(function () {

              $scope.$watch(function(){
                return $scope.algolia.req.query;
              },function(){
                resetQuerySettings();

                var facetObj = {};

                if (typeof $scope.account !== 'undefined'){
                  facetObj = {};
                  facetObj.name = $scope.account.user.uid; // to match the requirements of updateFacetFilters function
                  $scope.algolia.faceting.currentFacets.userID = [];
                  $scope.algolia.faceting.currentFacets.userID.push(facetObj);
                  $scope.algolia.req.facetFilters.push('userID:'+facetObj.name);
                }

                if (typeof $routeParams.userID !== 'undefined'){
                  facetObj = {};
                  facetObj.name = $routeParams.userID; // to match the requirements of updateFacetFilters function
                  $scope.algolia.faceting.currentFacets.userID = [];
                  $scope.algolia.faceting.currentFacets.userID.push(facetObj);
                  $scope.algolia.req.facetFilters.push('userID:'+facetObj.name);
                }

                search()
                  .then(function(){

                    //deferred.resolve();
                    //$scope.algolia.isReady = true;
                    $scope.lording.deferred.resolve();
                    $scope.lording.isDone = true;

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


        }
      };
    }]);