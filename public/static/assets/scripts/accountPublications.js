'use strict';

var publicationsModule = angular.module('accountPublications',['algoliasearch'])
  .controller('AccountPublicationsController',[
    '$scope',
    '$timeout',
    '$q',
    '$uibModal',
    '$routeParams',
    '$location',
    'FireRef',
    '$firebaseObject',
    function($scope, $timeout, $q, $uibModal, $routeParams, $location, FireRef, $firebaseObject){

      $scope.profile = {};

      $scope.publications = {
        more : false,
        count: 0,
        countDifference : 0,
        lastCount: 0,
        setCount: function (count, lastCount) {
          $scope.publications.count = count;
          if(lastCount){
            $scope.publications.lastCount = count;
          }
        }
      };

      $scope.lording = {
        deferred: $q.defer(),
        isDone: false,
        promises: []
      };

      $scope.lording.promise = $scope.lording.deferred.promise;

      function getProfile(){
        var deferred = $q.defer();

        function setProfile(userID){
          $scope.profile = $firebaseObject(FireRef.child('users').child(userID));
          $scope.profile.$banners = [];
          $scope.profile.$images  = [];
        }

        FireRef.child('accountNames').child($routeParams.accountName).once('value')
          .then(function(snapshot){
            if(snapshot.exists()){
              // get profile data by the id e.g k0JEbbtlGAhNN58sXdiBOUo9Z5g2
              setProfile(snapshot.val());
              return  $scope.profile.$loaded();
            }else{
              // maybe is a userID e.g berlinServices
              setProfile($routeParams.accountName);
              return  $scope.profile.$loaded();
            }
          })
          .then(function(){
            if(typeof $scope.profile.startedAt !== 'undefined'){

              $scope.profile.$seoURL = 'http://www.marketoflondon.co.uk/';
              $scope.profile.$seoURL += ($scope.profile.accountName !== undefined && $scope.profile.accountName !== '')? $scope.profile.accountName: $scope.profile.$id;

              deferred.resolve();
            }else {
              deferred.reject();
            }
          });

        return deferred.promise;
      }

      /**
       * Firebase paths:
       *
       * banners
       * profileBanners
       * featuredBannerId
       */
      function setProfileBanners (){
        var profileBanners = [];
        angular.forEach($scope.profile.banners, function(imageData,imageID){
          imageData.$id = imageID;
          if(imageID !== $scope.profile.featuredBannerId){
            profileBanners.push(imageData);
          }else{
            profileBanners.unshift(imageData)
          }
        });
        $scope.profile.$banners  = profileBanners;
      }

      /**
       * Firebase paths:
       *
       * images
       * profileImages
       * featuredImageId
       */
      function setProfileImages (){
        var profileImages = [];
        angular.forEach($scope.profile.images, function(imageData,imageID){
          imageData.$id = imageID;
          if(imageID !== $scope.profile.featuredImageId){
            profileImages.push(imageData);
          }else{
            profileImages.unshift(imageData)
          }
        });
        $scope.profile.$images = profileImages;
      }

      var getProfilePromise = getProfile()
        .then(function(){

          // new publications count
          var timeoutDoor = true;
          $scope.$watch(function(){
            return $scope.profile.publicationsCount;
          },function(newValue, oldValue){
            if(newValue > oldValue){
              if(timeoutDoor){
                timeoutDoor = false;
                $timeout(function(){
                  timeoutDoor = true;
                  $scope.publications.countDifference = $scope.profile.publicationsCount - $scope.publications.lastCount;
                  $scope.publications.setCount($scope.profile.publicationsCount);
                  $scope.publications.more = true;
                }, 10000);
              }
            }
          });

          $scope.$watch(function(){
            return $scope.profile.images;
          },function(){
            setProfileImages();
          });

          $scope.$watch(function(){
            return $scope.profile.banners;
          },function(){
            setProfileBanners();
          });

        },function(){
          // 404
          $location.path('/');
        });

      $scope.lording.promises.push(getProfilePromise);

      $scope.profileImages = function(size, active){
        if(angular.isDefined($scope.profile.$images) && $scope.profile.$images.length > 0){
          $uibModal.open({
            templateUrl: 'static/assets/views/profileImagesModal.html',
            controller: 'ProfileImagesController',
            size: size,
            resolve: {
              profileImages: function () {
                return $scope.profile.$images;
              },
              active: function () {
                return active;
              }
            }
          });
        }
      };

    }])
  .controller('ProfileImagesController',[ '$scope', '$uibModalInstance', 'profileImages', 'active',function($scope, $uibModalInstance, profileImages, active){

    $scope.profileImages = profileImages;

    $scope.active = typeof active !== 'undefined' ? active : 0;

    $scope.cancel = function () {
      $uibModalInstance.dismiss();
    };

  }]);
