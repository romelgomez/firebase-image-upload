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

      //https://www.firebase.com/docs/web/libraries/angular/api.html#angularfire-firebaseobject-watchcallback-context

      //$scope.profile = {};
      //$scope.$profileBanners = [];
      //$scope.$profileImages  = [];
      //$scope.accountPublications = {
      //  thereAreNew : false
      //};

      $scope.profile = {};

      $scope.publications = {
        more : false,
        count: 0,
        countDifference : 0
      };

      $scope.lording = {
        deferred: $q.defer(),
        isDone: false,
        promises: []
      };

      $scope.lording.promise = $scope.lording.deferred.promise;

      function getProfile(){
        var deferred = $q.defer();

        var accountNameRef = FireRef.child('accountNames').child($routeParams.accountName);

        function setProfile(userID){
          $scope.profile = $firebaseObject(FireRef.child('users').child(userID));
          $scope.profile.$banners = [];
          $scope.profile.$images  = [];

          //angular.extend($scope.profile, $firebaseObject(FireRef.child('users').child(userID)));
          //$scope.account.profile = ;
        }

        accountNameRef.once('value')
          .then(function(snapshot){
            if(snapshot.exists()){
              // get profile data by the id (snapshot.val() - facebook:10204911533563856)
              setProfile(snapshot.val());
              //angular.extend($scope.profile, $firebaseObject(FireRef.child('users').child(snapshot.val())));
              return  $scope.profile.$loaded();
            }else{
              // maybe is a userID
              //angular.extend($scope.profile, $firebaseObject(FireRef.child('users').child($routeParams.accountName)));
              setProfile($routeParams.accountName);
              return  $scope.profile.$loaded();
            }
          })
          .then(function(){
            if(typeof $scope.profile.startedAt !== 'undefined'){
                deferred.resolve();
            }else {
                deferred.reject();
            }
          });

        return deferred.promise;
      }

      function setProfileBanners (){
        /*
         banners
         profileBanners
         featuredBannerId
         */
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

      function setProfileImages (){
        /*
         images
         profileImages
         featuredImageId
         */
        var profileImages = [];
        //console.log('$scope.profile.images', $scope.profile.images);
        angular.forEach($scope.profile.images, function(imageData,imageID){
          imageData.$id = imageID;
          if(imageID !== $scope.profile.featuredImageId){
            profileImages.push(imageData);
          }else{
            profileImages.unshift(imageData)
          }
        });
        $scope.profile.$images = profileImages;
        //console.log('$scope.$profileImages', $scope.$profileImages);
      }

      $scope.publications.setCount = function (count, viewCount) {
        $scope.publications.count = count;

        console.log('1 $scope.publications.viewCount', $scope.publications.viewCount);
        if(viewCount){
          $scope.publications.viewCount = count;
        }
        console.log('2 $scope.publications.viewCount', $scope.publications.viewCount);
      };

      var getProfilePromise = getProfile()
        .then(function(){

          // Establecer publicaciones actuales
          //$scope.publications.setCount($scope.profile.publicationsCount, true);

          // bloqueador para que el $timeout no se ejecute mas de dos veces al mismo tiempo.
          var timeoutDoor = true;

          $scope.$watch(function(){
            return $scope.profile.publicationsCount;
          },function(newValue, oldValue){
            if(newValue > oldValue){
              if(timeoutDoor){

                // cierra la puerta para que $timeout no se ejecute nuevamente hasta este finalice
                timeoutDoor = false;
                $timeout(function(){

                  // habre la puerta
                  timeoutDoor = true;

                  $scope.publications.countDifference = $scope.profile.publicationsCount - $scope.publications.viewCount;

                  //if(typeof  $scope.publications.viewCount !== 'undefined'){
                  //  // direrencia = actual count -  count inicial
                  //  $scope.publications.countDifference = $scope.profile.publicationsCount - $scope.publications.viewCount;
                  //}else{
                  //  setPublicationsCount($scope.profile.publicationsCount);
                  //  $scope.publications.countDifference = $scope.profile.publicationsCount - $scope.publications.viewCount;
                  //}

                  //$scope.publications.countDifference = newValue - $scope.publications.viewCount;

                  $scope.publications.setCount($scope.profile.publicationsCount);

                  // muestra el botton para actualizar los resultados.
                  $scope.publications.more = true;

                  //$scope.accountPublications.thereAreNew = true;
                  //$scope.accountPublications.newCount = newValue;
                  //$scope.accountPublications.newCountDifference = newValue - $scope.algolia.res.nbHits;

                }, 10000);
              }

            }
          });

          $scope.$watch(function(){
            return $scope.profile.images;
          },function(){
            //console.log('setProfileImages is called');
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

      $scope.profileImages = function(size, active){
        if(angular.isDefined($scope.profile.$images) && $scope.profile.$images.length > 0){
          var modalInstance = $uibModal.open({
            templateUrl: 'profileImagesModal.html',
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

          modalInstance.result.then(function () {
            //notificationService.success('');
          }, function (error) {
            //modalErrors(error);
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
