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

      $scope.publication = {
        rawData: {},
        images: []
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

            $scope.publication.rawData = the.publication;

            angular.forEach(the.publication.images, function(imageData,imageID){
              imageData.$id = imageID;
              if(imageID !== the.publication.featuredImageId){
                $scope.publication.images.push(imageData);
              }else{
                $scope.publication.images.unshift(imageData)
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

    }]);
