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

      function loadPublication(publicationId) {
        var deferred   = $q.defer();

        FireRef.child('publications').child(publicationId).once('value')
          .then(function(snapshot){
            var publication = snapshot.val();
            publication.$id = snapshot.key();

            if (typeof publication.releaseDate === 'undefined'){
              deferred.reject();
            }  else {
              deferred.resolve({publication: publication});
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
            profile.$id = snapshot.key();

            deferred.resolve({profile: profile});
          },function (error) {
            deferred.reject(error);
          });

        return deferred.promise;
      }

      if(angular.isDefined($routeParams.publicationId)){

        var deferred   = $q.defer();
        $scope.httpRequestPromise = deferred.promise;

        loadPublication($routeParams.publicationId)
          .then(function(the){

            $scope.publication.data             = the.publication;
            $scope.publication.$barcode.string  = the.publication.barcode;
            $scope.publication.$seo.url         = 'https://londres.herokuapp.com/view-publication/' + the.publication.$id + '/' + $filter('slug')(the.publication.title) + '.html'

            angular.forEach(the.publication.images, function(imageData,imageID){
              imageData.$id = imageID;
              if(imageID !== the.publication.featuredImageId){
                $scope.publication.$images.push(imageData);
              }else{
                $scope.publication.$images.unshift(imageData)
              }
            });

            loadProfile(the.publication.userID)
              .then(function(the){
                $scope.profile = the.profile;
                $scope.publication.$isReady = true;
                deferred.resolve();
              },function () {
                notificationService.error('This action cannot be completed.');
                $location.path('/');
              });

          }, function () {
            notificationService.error('This action cannot be completed.');
            $location.path('/');
          });
      }else{
        notificationService.error('This action cannot be completed.');
        $location.path('/');
      }

    }])
  .directive('facebook',['$window', function ($window) {

    return {
      restrict:'E',
      scope:{
        url:'='
      },
      template:''+
      '<div class="fb-like" data-href="{{url}}" data-layout="button_count" data-action="like" data-show-faces="true" data-share="true"></div>',
      link:function(scope){

        if (typeof $window.FB !== 'undefined'){
          scope.$watch(function(scope){
            return scope.url;
          },function(){
            $window.FB.XFBML.parse();
          });

        }

      }
    }

  }]);
