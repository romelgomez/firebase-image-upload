publicationsModule
  .controller('ViewAllPublicationController',[
    '$scope',
    '$q',
    '$uibModal',
    function($scope, $q, $uibModal){

      $scope.user = {};

      $scope.lording = {
        deferred: $q.defer(),
        isDone: false,
        promises: []
      };

      $scope.lording.promise = $scope.lording.deferred.promise;

      $scope.profileImages = function(){
        console.log('user', $scope.user);
      };

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
        if(angular.isDefined($scope.user.profileImages) && $scope.user.profileImages.length > 0){
          var modalInstance = $uibModal.open({
            templateUrl: 'profileImagesModal.html',
            controller: 'ProfileImagesController',
            size: size,
            resolve: {
              profileImages: function () {
                return $scope.user.profileImages;
              }
            }
          });

          modalInstance.result.then(function () {
            //notificationService.success('The auction offer has been added.');
          }, function (error) {
            //modalErrors(error);
          });

        }else{
          notificationService.error('You have already all the '+ item.$id + ' inventory compromised.');
        }
      };

    }])
    .controller('ProfileImagesController',[ '$scope', '$uibModalInstance', 'profileImages' ,function($scope, $uibModalInstance, profileImages){

      $scope.profileImages = profileImages;

    }]);