'use strict';

$.cloudinary.config().cloud_name = 'berlin';

angular.module('account',['trTrustpass','ngPasswordStrength','cloudinary','algoliasearch'])
  .controller('AccountController',['$scope', '$q', 'user', '$uibModal', 'FireRef', '$firebaseObject', 'notificationService', '$log', function ($scope, $q, user, $uibModal, FireRef, $firebaseObject, notificationService, $log) {

    $scope.account = {
      user:user,
      profile: $firebaseObject(FireRef.child('users/'+user.uid)),
      publications: {},
      publicationsImages: {}
    };

  }])
  .controller('AccountPublicationsController',[
    '$scope',
    '$q',
    'FireRef',
    '$firebaseObject',
    '$firebaseArray',
    '$timeout',
    '$location',
    'algolia',
    '$log', function( $scope, $q, FireRef, $firebaseObject, $firebaseArray, $timeout, $location, algolia, $log){

      var configTasks = {};
      var client = algolia.Client('FU6V8V2Y6Q', '75b635c7c8656803b0b9e82e0510f266');
      var index  = client.initIndex('publications');
      var categories = $firebaseArray(FireRef.child('categories').orderByChild('left'));
      configTasks.categories = categories.$loaded();

      $scope.isCollapsed = true; // TODO FOR DEBUG

      var itemsPerPage = 2;
      var algoliaOriginalSettings = angular.copy($scope.algolia = {
        req : {
          query: '',
          facets:'*',
          facetFilters: ['userID:'+$scope.account.user.uid],
          // number of hits per page
          hitsPerPage: itemsPerPage,
          getRankingInfo: 1,
          // current page number
          page: 0,
          highlightPreTag: '<b>',
          highlightPostTag: '</b>'
        },
        res: {},
        pagination: {
          // number of pages that are visible
          maxSize: 10,
          // number of publications per page
          itemsPerPage: itemsPerPage,
          // current page
          currentPage : 1,
          pageChanged : function() {
            $scope.algolia.req.page = $scope.algolia.pagination.currentPage-1;
            search();
          }
        },
        faceting: {
          facetsAvailables : [],
          currentFacets: [],
          addFacet: function(facet){
            // {"left":5,"name":"Real Estate","parentId":"","right":10,"$id":"-K5pzphvGtzcQhxopgpD","$priority":null,"count":1}

            $scope.algolia.faceting.currentFacets.push(facet);
            $scope.algolia.req.facetFilters.push('categories:'+facet.name);
            search();
          },
          removeFacet: function (facet,index) {
            $scope.algolia.req.facetFilters = ['userID:'+$scope.account.user.uid];
            var currentFacets = $scope.algolia.faceting.currentFacets;
            $scope.algolia.faceting.currentFacets = [];
            for (var i  = 0; i <= index; i++){
              $scope.algolia.req.facetFilters.push('categories:'+currentFacets[i].name);
              $scope.algolia.faceting.currentFacets.push(currentFacets[i]);
              if(i === index){
                search();
              }
            }
          },
          removeAllFacet: function () {
            angular.copy([],$scope.algolia.faceting.currentFacets);
            $scope.algolia.req.facetFilters = ['userID:'+$scope.account.user.uid];
            search();
          }
        }
      });

      function search (){
        var deferred   = $q.defer();
        function startSearch (){
          index.search($scope.algolia.req)
            .then(function(res) {
              if(res.query !== $scope.algolia.req.query){
                startSearch();
              }else{
                $scope.algolia.res = res;
                setFacetedSearchMenu();
                deferred.resolve();
              }
            }, function(err){
              deferred.reject(err);
            });
        }
        startSearch();
        return deferred.promise;
      }

      /**
       * This function set the faceted menu after the request is made
       * @return {Undefined}
       */
      function setFacetedSearchMenu(){
        $scope.algolia.faceting.facetsAvailables = [];

        // needles
        angular.forEach($scope.algolia.res.facets.categories, function (count, facetName) {

          // haystack
          angular.forEach(categories, function(categoryObj){
            if(facetName === categoryObj.name){
              // Children facets
              if($scope.algolia.faceting.currentFacets.length > 0){
                var lastObj = $scope._($scope.algolia.faceting.currentFacets)
                  .last();
                if(categoryObj.parentId === lastObj.$id){
                  categoryObj.count = count;
                  $scope.algolia.faceting.facetsAvailables.push(categoryObj);
                }
              }else{
              // Root facets
                  if(categoryObj.parentId === ''){
                    categoryObj.count = count;
                    $scope.algolia.faceting.facetsAvailables.push(categoryObj);
                  }
              }
            }
          });
        });

      }

      var deferred   = $q.defer();
      $scope.httpRequestPromise = deferred.promise;

      $q.all(configTasks)
        .then(function () {

          $scope.$watch(function(){
            return $scope.algolia.req.query;
          },function(){
            $scope.algolia.req.page = 0;
            $scope.algolia.pagination.currentPage = 1;
            search()
              .then(null,function(){
                notificationService.error(err);
              })
          });

        })
        .then(function(){
          $scope.thePublicationsAreReady = true;
          deferred.resolve();
        });


    $scope.editPublication = function (publicationId) {
      $location.path('/edit-publication/'+publicationId);
    };

    $scope.viewPublication = function (publicationId) {
      $location.path('/view-publication/'+publicationId);
    };

  }])
  .controller('AccountProfileController',['$scope', '$uibModal','notificationService',function($scope, $uibModal, notificationService){

    $scope.account.httpRequestPromise = $scope.account.profile.$loaded(null,function(error){
      notificationService.error(error);
    });

    var modalErrors = function(error){
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
    };

    $scope.changeProfileDetails = function(size){
      var modalInstance = $uibModal.open({
        templateUrl: 'accountProfileDetailsModal.html',
        controller: 'AccountProfileDetailsModalController',
        size: size,
        resolve: {
          profile: function () {
            return $scope.account.profile;
          }
        }
      });

      modalInstance.result.then(function () {
        notificationService.success('The profile has been updated.');
      }, function (error) {
        modalErrors(error);
      });
    };

    $scope.changePassword = function(size){
      var modalInstance = $uibModal.open({
        templateUrl: 'accountProfilePasswordModal.html',
        controller: 'AccountProfilePasswordModalController',
        size: size,
        resolve: {
          profile: function () {
            return $scope.account.profile;
          }
        }
      });

      modalInstance.result.then(function () {
        notificationService.success('The password has been updated.');
      }, function (error) {
        modalErrors(error);
      });
    };

    $scope.changeEmail = function(size){
      var modalInstance = $uibModal.open({
        templateUrl: 'accountProfileEmailModal.html',
        controller: 'AccountProfileEmailModalController',
        size: size,
        resolve: {
          profile: function () {
            return $scope.account.profile;
          }
        }
      });

      modalInstance.result.then(function () {
        notificationService.success('The email has been updated.');
      }, function (error) {
        modalErrors(error);
      });
    };


  }])
  .controller('AccountBillingController',['$scope', function($scope){

  }])
  .controller('AccountProfileDetailsModalController',['$scope','$modalInstance', 'profile', function($scope, $modalInstance, profile){

    $scope.forms = {
      profileDetails: {}
    };

    $scope.profile = profile;

    var original = angular.copy($scope.model = {
      profileDetails:{
        names:                angular.isDefined(profile.names) && profile.names !== '' ? profile.names : '',
        lastNames:            angular.isDefined(profile.lastNames) && profile.lastNames !== '' ? profile.lastNames : '',
        mobilePhone:          angular.isDefined(profile.mobilePhone) && profile.mobilePhone !== '' ? profile.mobilePhone : '',
        landLineTelephone:    angular.isDefined(profile.landLineTelephone) && profile.landLineTelephone !== '' ? profile.landLineTelephone : '',
        email:                angular.isDefined(profile.email) && profile.email !== '' ? profile.email : ''
      }
    });

    $scope.submit = function(){
      if($scope.forms.profileDetails.$valid){

        profile.names             = $scope.model.profileDetails.names;
        profile.lastNames         = $scope.model.profileDetails.lastNames;
        profile.mobilePhone       = $scope.model.profileDetails.mobilePhone;
        profile.landLineTelephone = $scope.model.profileDetails.landLineTelephone;

        if(profile.provider !== 'password'){
          profile.email = angular.isDefined($scope.model.profileDetails.email) ? $scope.model.profileDetails.email : '';
        }

        $scope.httpRequestPromise = profile.$save()
          .then(function() {
            $modalInstance.close();
          }, function(error) {
            $modalInstance.dismiss(error);
          });

      }
    };

    $scope.cancel = function () {
      $modalInstance.dismiss();
    };

  }])
  .controller('AccountProfilePasswordModalController',['$scope','$modalInstance','FireAuth','profile',function($scope, $modalInstance, FireAuth, profile){

    $scope.forms = {
      accountPassword: {}
    };

    var original = angular.copy($scope.model = {
      accountPassword:{
        oldPassword:'',
        newPassword:'',
        sameNewPassword:''
      }
    });

    $scope.submit = function(){
      if($scope.forms.accountPassword.$valid){

        $scope.httpRequestPromise = FireAuth.$changePassword({email: profile.email, oldPassword: $scope.model.accountPassword.oldPassword, newPassword: $scope.model.accountPassword.newPassword})
          .then(function() {
            $modalInstance.close();
          }, function(error){
            $modalInstance.dismiss(error);
          });

      }
    };

    $scope.cancel = function () {
      $modalInstance.dismiss();
    };

  }])
  .controller('AccountProfileEmailModalController',['$q', '$scope', '$modalInstance', 'FireAuth', 'profile',function( $q, $scope, $modalInstance, FireAuth, profile){

    $scope.forms = {
      emailAccount: {}
    };

    var original = angular.copy($scope.model = {
      emailAccount:{
        newEmail:'',
        password:''
      }
    });

    $scope.submit = function(){
      if($scope.forms.emailAccount.$valid){
        var deferred  = $q.defer();
        $scope.httpRequestPromise = deferred.promise;

        FireAuth.$changeEmail({password: $scope.model.emailAccount.password, newEmail: $scope.model.emailAccount.newEmail, oldEmail: profile.email})
          .then(function() {
            profile.email = $scope.model.emailAccount.newEmail;
            return profile.$save();
          })
          .then(function() {
            $modalInstance.close();
            deferred.resolve();
          }, function(error){
            $modalInstance.dismiss(error);
            deferred.reject(error);
          });

      }
    };

    $scope.resetForm = function(){
      angular.copy(original.emailAccount,$scope.model.emailAccount);
      $scope.forms.emailAccount.$setUntouched();
      $scope.forms.emailAccount.$setPristine();
    };

    $scope.cancel = function () {
      $modalInstance.dismiss();
    };

  }]);
