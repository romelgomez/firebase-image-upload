publicationsModule
  .controller('ViewPublicationController',[
    '$scope',
    '$q',
    '$window',
    '$filter',
    '$routeParams',
    '$location',
    '$http',
    'FireRef',
    '$firebaseArray',
    '$firebaseObject',
    'rfc4122',
    'notificationService',
    'Upload',
    '$uibModal',
    '$log',function($scope, $q, $window, $filter, $routeParams, $location, $http, FireRef, $firebaseArray, $firebaseObject, rfc4122, notificationService, $upload, $uibModal, $log){

      var publicationsRef  = FireRef.child('publications');

      $scope.c = {};

      $scope.barcode = {
        string:'',
        options: {
          width: 1,
          height: 50,
          quite: 10,
          format: 'CODE128',
          displayValue: true,
          font: 'monospace',
          textAlign: 'center',
          fontSize: 12,
          backgroundColor: '',
          lineColor: '#000'
        }
      };

      function loadPublication(publicationId) {
        var deferred   = $q.defer();

        var publicationRef = publicationsRef.child(publicationId);
        var publication    = $firebaseObject(publicationRef);

        publication.$loaded(function(){
          if (typeof publication.releaseDate === 'undefined'){
            deferred.reject();
          }  else {
            deferred.resolve({publication:publication});
          }
        }, function (error) {
          deferred.reject(error);
        });

        return deferred.promise;
      }

      if(angular.isDefined($routeParams.publicationId)){
        $scope.httpRequestPromise = loadPublication($routeParams.publicationId)
          .then(function(the){

            $scope.publication = the.publication;
            $scope.publicationImages = [];
            $scope.barcode.string = the.publication.barcode;

            $scope.seo = {
              url: 'https://londres.herokuapp.com/#/view-publication/' + the.publication.$id + '/' + $filter('slug')(the.publication.title) + '.html'
            };

            angular.forEach(the.publication.images, function(imageData,imageID){
              imageData.$id = imageID;
              if(imageID !== the.publication.featuredImageId){
                $scope.publicationImages.push(imageData);
              }else{
                $scope.publicationImages.unshift(imageData)
              }
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
      link:function(){

        if (typeof $window.FB !== 'undefined'){
          $window.FB.XFBML.parse();
        }

      }
    }

  }]);
