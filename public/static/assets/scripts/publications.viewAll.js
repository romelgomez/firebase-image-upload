publicationsModule
  .controller('ViewAllPublicationController',[
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

      //var publicationsRef  = FireRef.child('publications');
      //var usersRef         = FireRef.child('users');
      //
      //$scope.publication = {
      //  isReady: false,
      //  res:{},
      //  images:[],
      //  user:{},
      //  barcode : {
      //    string:'',
      //    options: {
      //      width: 1,
      //      height: 50,
      //      quite: 10,
      //      format: 'CODE128',
      //      displayValue: true,
      //      font: 'monospace',
      //      textAlign: 'center',
      //      fontSize: 12,
      //      backgroundColor: '',
      //      lineColor: '#000'
      //    }
      //  }
      //};
      //
      //
      //function loadPublication(publicationId) {
      //  var deferred   = $q.defer();
      //
      //  var publicationRef = publicationsRef.child(publicationId);
      //  var publication    = $firebaseObject(publicationRef);
      //
      //  publication.$loaded(function(){
      //    if (typeof publication.releaseDate === 'undefined'){
      //      deferred.reject();
      //    }  else {
      //      deferred.resolve({publication:publication});
      //    }
      //  }, function (error) {
      //    deferred.reject(error);
      //  });
      //
      //  return deferred.promise;
      //}
      //
      //function loadUser(userID) {
      //  var deferred   = $q.defer();
      //
      //  var userRef   = usersRef.child(userID);
      //  var user      = $firebaseObject(userRef);
      //
      //  user.$loaded(function(){
      //    deferred.resolve({user:user});
      //  }, function (error) {
      //    deferred.reject(error);
      //  });
      //
      //  return deferred.promise;
      //}
      //
      //if(angular.isDefined($routeParams.publicationId)){
      //
      //  var deferred   = $q.defer();
      //  $scope.httpRequestPromise = deferred.promise;
      //
      //  loadPublication($routeParams.publicationId)
      //    .then(function(the){
      //
      //      $scope.publication.res            = the.publication;
      //      $scope.publication.barcode.string = the.publication.barcode;
      //
      //      $scope.seo = {
      //        url: 'https://londres.herokuapp.com/#/view-publication/' + the.publication.$id + '/' + $filter('slug')(the.publication.title) + '.html'
      //      };
      //
      //      angular.forEach(the.publication.images, function(imageData,imageID){
      //        imageData.$id = imageID;
      //        if(imageID !== the.publication.featuredImageId){
      //          $scope.publication.images.push(imageData);
      //        }else{
      //          $scope.publication.images.unshift(imageData)
      //        }
      //      });
      //
      //      loadUser(the.publication.userID)
      //        .then(function(the){
      //          $scope.publication.user = the.user;
      //          $scope.publication.isReady = true;
      //          deferred.resolve();
      //        },function () {
      //          notificationService.error('This action cannot be completed.');
      //          $location.path('/');
      //        });
      //    }, function () {
      //      notificationService.error('This action cannot be completed.');
      //      $location.path('/');
      //    });
      //}else{
      //  notificationService.error('This action cannot be completed.');
      //  $location.path('/');
      //}

    }]);