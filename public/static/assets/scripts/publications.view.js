publicationsModule
  .controller('ViewPublicationController',[
    '$scope',
    '$q',
    '$window',
    '$filter',
    '$routeParams',
    '$location',
    'FireRef',
    '$firebaseObject',
    'notificationService',
    function($scope, $q, $window, $filter, $routeParams, $location, FireRef, $firebaseObject, notificationService){

      $scope.publication = {
        $isReady: false,
        data: {},
        $images:[],
        $barcode : {
          string:'',
          options: {
            width: 1,
            height: 10,
            quite: 10,
            format: 'CODE128',
            displayValue: true,
            font: 'monospace',
            textAlign: 'center',
            fontSize: 10,
            backgroundColor: '',
            lineColor: '#000'
          }
        },
        $seo: {
          url: ''
        }
      };

      function loadPublication(publicationID) {
        var deferred   = $q.defer();

        FireRef.child('publications').child(publicationID).once('value')
          .then(function(snapshot){
            if(snapshot.exists()){
              var publication = snapshot.val();
              publication.$id = snapshot.key;

              if (typeof publication.releaseDate === 'undefined'){
                deferred.reject();
              }  else {
                deferred.resolve({publication: publication});
              }
            }else{
              deferred.reject();
            }
          },function (error) {
            deferred.reject(error);
          });

        return deferred.promise;
      }

      function loadProfile(userID) {
        var deferred   = $q.defer();

        FireRef.child('users').child(userID).once('value')
          .then(function(snapshot){
            var profile = snapshot.val();
            profile.$id = snapshot.key;

            deferred.resolve({profile: profile});
          },function (error) {
            deferred.reject(error);
          });

        return deferred.promise;
      }

      if(angular.isDefined($routeParams.publicationID)){

        var deferred   = $q.defer();
        $scope.httpRequestPromise = deferred.promise;

        loadPublication($routeParams.publicationID)
          .then(function(the){

            $scope.publication.data             = the.publication;
            $scope.publication.$barcode.string  = the.publication.barcode;

            angular.forEach(the.publication.images, function(imageData,imageID){
              imageData.$id = imageID;
              if(imageID !== the.publication.featuredImageId){
                $scope.publication.$images.push(imageData);
              }else{
                $scope.publication.$images.unshift(imageData)
              }
            });

            return loadProfile(the.publication.userID);
          })
          .then(function(the){
            $scope.profile = the.profile;

            var seoUrl = 'https://londres.herokuapp.com/';

            var categoriesAndLocations = '';
            var categories = $window._.join($scope.publication.data.categories, ' ');
            var locations  = $window._.join($scope.publication.data.locations, ' ');
            categoriesAndLocations += categories;
            categoriesAndLocations += ' in ';
            categoriesAndLocations += locations;

            seoUrl += typeof the.profile.accountName !== 'undefined' && the.profile.accountName !== '' ? the.profile.accountName + '/': the.profile.$id + '/';
            seoUrl += $filter('slug')(categoriesAndLocations) + '/';
            seoUrl += $scope.publication.data.$id + '/';
            seoUrl += $filter('slug')($scope.publication.data.title) + '.html';

            $scope.publication.$seo.url = seoUrl;

            $scope.publication.$isReady = true;
            deferred.resolve();
          },function () {
            notificationService.error('This action cannot be completed.');
            $location.path('/');
          });

      }else{
        notificationService.error('This action cannot be completed.');
        $location.path('/');
      }

    }]);
