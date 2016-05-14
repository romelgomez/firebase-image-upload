'use strict';

var publicationsModule = angular.module('accountPublications',['algoliasearch'])
  .controller('AccountPublicationsController',[
    '$scope',
    '$q',
    '$uibModal',
    '$routeParams',
    '$location',
    'FireRef',
    function($scope, $q, $uibModal, $routeParams, $location, FireRef){

      $scope.profile = {};

      $scope.lording = {
        deferred: $q.defer(),
        isDone: false,
        promises: []
      };

      $scope.lording.promise = $scope.lording.deferred.promise;

      function getProfile(){
        var deferred = $q.defer();

        var accountNameRef = FireRef.child('accountNames').child($routeParams.accountName);

        accountNameRef.once('value')
          .then(function(snapshot){
            if(snapshot.exists()){
              // get profile data by the id (snapshot.val() - facebook:10204911533563856)
              return FireRef.child('users').child(snapshot.val()).once('value');
            }else{
              // maybe is a userID
              return FireRef.child('users').child($routeParams.accountName).once('value');
            }
          })
          .then(function(snapshot){
            if(snapshot.exists()){
              var profile = snapshot.val(); // {accountName: "londonServicesLTD", banners: Object, bio: "", email: "bmxquiksilver7185@gmail.com", facebookAccount: "https://www.facebook.com/romelgomez"…}
              profile.$id = snapshot.key(); // facebook:10204911533563856
              deferred.resolve({profile: profile});
            }else{
              deferred.reject();
            }
          });

        return deferred.promise;
      }

      var getProfilePromise = getProfile()
        .then(function(the){
          $scope.profile = the.profile;

          $scope.profile.$banners = [];
          $scope.profile.$images  = [];

          /*
           banners
           profileBanners
           featuredBannerId
           */

          angular.forEach(the.profile.banners, function(imageData,imageID){
            imageData.$id = imageID;
            if(imageID !== the.profile.featuredBannerId){
              $scope.profile.$banners.push(imageData);
            }else{
              $scope.profile.$banners.unshift(imageData)
            }
          });

          /*
           images
           profileImages
           featuredImageId
           */

          angular.forEach(the.profile.images, function(imageData,imageID){
            imageData.$id = imageID;
            if(imageID !== the.profile.featuredImageId){
              $scope.profile.$images.push(imageData);
            }else{
              $scope.profile.$images.unshift(imageData)
            }
          });

          //$scope.profile.image = ;

        },function(){
          // 404
          $location.path('/');
        });

      $scope.lording.promises.push(getProfilePromise);

      function modalErrors(error){
        switch(error) {
          case 'escape key press':
            notificationService.notice('This action was canceled by the user');
            break;
          case undefined:
            notificationService.notice('This action was canceled by the user');
            break;
          case 'backdrop click':
            notificationService.notice('This action was canceled by the user');
            break;
          default:
            notificationService.error(error);
        }
      }

      $scope.profileImages = function(size){
        if(angular.isDefined($scope.profile.$images) && $scope.profile.$images.length > 0){
          var modalInstance = $uibModal.open({
            templateUrl: 'profileImagesModal.html',
            controller: 'ProfileImagesController',
            size: size,
            resolve: {
              profileImages: function () {
                return $scope.profile.$images;
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

    }])
  .controller('ProfileImagesController',[ '$scope', '$modalInstance', 'profileImages' ,function($scope, $modalInstance, profileImages){

    $scope.profileImages = profileImages;

  }]);
