'use strict';

var publicationsModule = angular.module('publications',['uuid','ngMessages','angular-redactor','ngFileUpload','cloudinary','algoliasearch', 'images'])
  .factory('publicationService',['$q', '$window', 'FireRef', 'imagesService', function( $q, $window, FireRef, imagesService){

    var publicationsRef = FireRef.child('publications');


    function updateCount( userID, newOne){
      var deferred = $q.defer();

      var publicationsCountRef = FireRef.child('users').child(userID).child('publicationsCount');

      publicationsCountRef.once('value',function(snapshot){
        var count;
        if(snapshot.exists()){
          count = snapshot.val();
        }else{
          count = 0;
        }

        if(typeof newOne !== 'undefined' && newOne === true){
          count += 1;
        } else {
          count -= 1;
        }

        publicationsCountRef.set(count)
          .then(function(){
            deferred.resolve();
          },function(error){
            deferred.reject(error);
          });

      });

      return deferred.promise;
    }


    return {
      savePublication: function(publicationModel, publicationId, userID) {
        var deferred                            = $q.defer();

        if(angular.isDefined(publicationId) && publicationId !== ''){
          // update record
          var publicationRef = publicationsRef.child(publicationId);

          delete publicationModel.releaseDate;
          delete publicationModel.images;

          publicationRef.update(publicationModel, function (error) {
            if (error) {
              deferred.reject(error);
            } else {
              deferred.resolve({publicationId: publicationId});
            }
          });

        }else{
          // new record
          var newPublicationRef = publicationsRef.push(); // like array element
          publicationModel.releaseDate = $window.firebase.database.ServerValue.TIMESTAMP;
          newPublicationRef.set(publicationModel)
            .then(function(){
              return updateCount(userID, true);
            })
            .then(function(){
              deferred.resolve({publicationId: newPublicationRef.key});
            },function(error){
              deferred.reject(error);
            });
        }

        return deferred.promise;
      },
      removePublication : function( publicationId, userID){
        var deferred                            = $q.defer();
        var promises                            = [];

        promises.push(imagesService.deleteImages(publicationId,null));
        promises.push(publicationsRef.child(publicationId).remove());
        promises.push(updateCount(userID));

        $q.all(promises)
          .then(function(){
            deferred.resolve();
          }, function (error) {
            notificationService.error(error);
          });

        return deferred.promise;
      },
      saveFilesData : function( publicationID, files) {
        var deferred                            = $q.defer();

        var publicationImagesRef = publicationsRef.child(publicationID).child('images');
        var saveFilesData = [];

        angular.forEach(files,function(fileData, fileID){
          saveFilesData.push(publicationImagesRef.child(fileID).set(fileData));
        });

        $q.all(saveFilesData)
          .then(function(){
            deferred.resolve();
          });

        return deferred.promise;
      },
      loadPublication : function (userID, publicationID) {
        var deferred   = $q.defer();

        publicationsRef.child(publicationID).once('value',function(snapshot){
          var publication = snapshot.val();
          if(snapshot.exists()){
            if(userID === publication.userID){
              deferred.resolve({publication:publication});
            }else{
              deferred.reject('401');
            }
          } else {
            deferred.reject('404');
          }

        });

        return deferred.promise;
      }
    };

  }])

  .controller('PublicationsController',[
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
    'treeService',
    'notificationService',
    'Upload',
    'user',
    '$uibModal',
    'publicationService',
    'imagesService',
    '$log',function($scope, $q, $window, $filter, $routeParams, $location, $http, FireRef, $firebaseArray, $firebaseObject, rfc4122, treeService, notificationService, $upload, user, $uibModal, publicationService, imagesService, $log){

      var deferred = $q.defer();
      //var publicationsRef = FireRef.child('publications');

      $scope.httpRequestPromise = deferred.promise;

      $scope.publication = {
        $id: '',
        categoryPath: [],
        locationPath: [],
        categorySelected: false,
        inEditMode: false,
        isReady: false,
        model : {
          userID:               user.uid,
          categoryId:           '',
          locationId:           '',
          featuredImageId:      '',
          department:           '',
          title:                '',
          htmlDescription:      '',
          barcode:              '',
          barcodeType:          'CODE128'
        }
      };

      var categoriesDeferredObject  = $q.defer();
      var locationsDeferredObject    = $q.defer();

      var categories = $firebaseArray(FireRef.child('categories').orderByChild('left'));
      categories.$loaded()
        .then(function () {
          $scope.publication.categories = angular.copy(categories);
          categoriesDeferredObject.resolve();
          categories.$destroy();
        },function(error){
          deferred.reject(error);
        });

      var locations = $firebaseArray(FireRef.child('locations').orderByChild('left'));
      locations.$loaded()
        .then(function () {
          $scope.publication.locations = angular.copy(locations);
          locationsDeferredObject.resolve();
          locations.$destroy();
        },function(error){
          deferred.reject(error);
        });

      $q.all([ categoriesDeferredObject.promise, locationsDeferredObject.promise])
        .then(function () {
          if(angular.isDefined($routeParams.publicationId)){
            return setPublication($routeParams.publicationId);
          }else{
            $scope.publication.images = []; // If this definition is moved to the main object the images in edit mode after F5 are not recognized.
          }
        })
        .then(function(){
          $scope.publication.isReady = true;
          deferred.resolve();
        });

      $scope.submit = function(){
        if($scope.publicationForm.$valid){
          var deferred    = $q.defer();

          publicationService.savePublication( $scope.publication.model, $scope.publication.$id, user.uid)
            .then(function(the){
              $scope.publication.$id = $scope.publication.$id !== '' ? $scope.publication.$id : the.publicationId;
              // Save files in Cloudinary
              return imagesService.uploadFiles($scope.publication.images, $scope.publication.$id)
            })
            .then(function (files) {
              return publicationService.saveFilesData($scope.publication.$id, files);
            })
            .then(function(){
              notificationService.success('Data has been save');
              deferred.resolve();
            },function(error){
              notificationService.error(error);
              deferred.reject(error);
            });

          $scope.httpRequestPromise = deferred.promise;
        }else{
          notificationService.error('Something is missing');
        }
      };

      $scope.discard = function(){
        console.log($scope.publication.model.title !== '' && $scope.publication.model.title !== undefined  ? $scope.publication.model.title : 'Untitled');

        var modalInstance = $uibModal.open({
          templateUrl: 'discardPublication.html',
          controller: 'DiscardPublicationController',
          resolve: {
            publicationId:function(){
              return $scope.publication.$id !== '';
            },
            title: function () {
              return $scope.publication.model.title !== '' && $scope.publication.model.title !== undefined  ? $scope.publication.model.title : 'Untitled';
            }
          }
        });

        modalInstance.result.then(function(){
          if($scope.publication.$id !== ''){
            $scope.httpRequestPromise = publicationService.removePublication($scope.publication.$id, user.uid)
              .then(function(){
                notificationService.success('The publication has been deleted.');
                $location.path('/');
              });
          }else{
            notificationService.success('The publication has been discard.');
            $location.path('/');
          }
        }, function (error) {
          notificationService.error(error);
        });
      };

      //function loadPublication(publicationID){
      //  var deferred   = $q.defer();
      //
      //  var publicationRef = publicationsRef.child(publicationID);
      //
      //  publicationRef.once('value',function(snapshot){
      //    var publication = snapshot.val();
      //    if(snapshot.exists()){
      //      if(user.uid === publication.userID){
      //        deferred.resolve({publication:publication});
      //      }else{
      //        deferred.reject('401');
      //      }
      //    } else {
      //      deferred.reject('404');
      //    }
      //
      //  });
      //
      //  return deferred.promise;
      //}

      function setPublication(publicationId){
        var deferred   = $q.defer();

        publicationService.loadPublication( user.uid, publicationId)
          .then(function (the) {
            angular.forEach(the.publication, function ( value, key) {
              if(key !== 'releaseDate'){
                $scope.publication.model[key] = value;
              }
            });
          })
          .then(function(){
            $scope.publication.images = [];
            angular.forEach($scope.publication.model.images, function(value, key){
              value.$id = key;
              value.$ngfWidth   = value.width;
              value.$ngfHeight  = value.height;
              value.size        = typeof value.size !== 'undefined' ? value.size : value.bytes;
              value.isUploaded  = true;
              value.name        = typeof value.name !== 'undefined' ? value.name : value.original_filename + '.' + value.format;
              $scope.publication.images.push(value);
            })
          })
          .then(function(){
            $scope.publication.$id              = publicationId;

            $scope.publication.categoryPath             = treeService.getPath($scope.publication.model.categoryId,$scope.publication.categories);
            if($scope.publication.categoryPath.length > 0){
              $scope.publication.categorySelected = true;
            }else{
              // This mean that for some reason the categories database it got lost completely or partially temporarily, and with this, we force the user redefine category.
              $scope.publication.redefineCategory = true;
              $scope.publication.categorySelected = false;
              $scope.publication.model.categoryId = '';
            }

            $scope.publication.locationPath     = treeService.getPath($scope.publication.model.locationId,$scope.publication.locations);
            if($scope.publication.locationPath.length === 0){
              // This mean that for some reason the location database it got lost completely or partially temporarily, and with this, we force the user redefine the location.
              $scope.publication.redefineLocation = true;
              $scope.publication.model.locationId = '';
            }

            $scope.publication.inEditMode       = true;
            deferred.resolve();
          },function(error){
            $location.path('/');
            deferred.reject(error);
          });

        return deferred.promise;
      }

    }])
  .controller('DiscardPublicationController',['$scope', '$uibModalInstance', 'publicationId', 'title',function($scope, $uibModalInstance, publicationId, title){

    $scope.publication = {
      $id: publicationId,
      title: title
    };

    $scope.confirm  = function () {
      $uibModalInstance.close();
    };

    $scope.cancel   = function () {
      $uibModalInstance.dismiss('This has be cancel');
    };

  }])
  .directive('locationInput',['treeService',function(treeService){

    return {
      scope:{
        formName:'=',
        locations:'=',
        model:'=',
        redefineLocation:'=',
        locationPath:'='
      },
      template:'' +
      '<div>'+
        '<hr class="hr-xs">'+
        '<label class="control-label"><i class="fa fa-map-marker"></i> Location <sup style="color: red;">*</sup></label>'+
        '<div class="list-group" style="margin-bottom: 0">'+
          '<button type="button" class="list-group-item" ng-click="setLocation(location.$id); publication.redefineLocation = false;" ng-repeat="location in locations | filter:{parentId: model.locationId}:true" ><i style="color: #286090" class="fa fa-folder"></i> {{location.name | capitalizeFirstChar}}</button>'+
        '</div>'+

        '<ol ng-show="locationPath.length > 0" class="breadcrumb" style="margin-bottom: 0; margin-top: 10px;">'+
          '<li ng-click="model.locationId =\'\'; locationPath =[];" class="a-link"> Reset </li>'+
          '<li ng-repeat="location in locationPath" ng-click="setLocation(location.$id)" ng-class="{\'a-link\': !$last}"> {{location.name | capitalizeFirstChar}} </li>'+
        '</ol>'+

        '<input name="location" ng-model="model.locationId" required class="form-control" placeholder="" type="text" style="display: none;">'+
        '<div data-ng-messages="formName.$submitted && formName.location.$error" class="help-block">'+
          '<div data-ng-message="required" >'+
          '- The <b>Location</b> is required.'+
          '</div>'+
        '</div>'+

        '<div ng-show="formName.redefineLocation === true" class="alert alert-danger alert-xs" style="margin-bottom: 10px;" role="alert"><b>NOTE: Sorry, but we need to redefine the location.</b></div>'+
        '<div class="alert alert-info alert-xs" style="margin-bottom: 0; margin-top: 10px;" role="alert">NOTE: Select the <b>location</b> that best suits to the publication. No matter if it is too general or specific, the important thing is to select one.</div>'+
      '</div>',
      link:function(scope){

        scope.setLocation = function (locationId) {
          scope.model.locationId          = locationId;
          scope.locationPath              = treeService.getPath(locationId,scope.locations);
          scope.model.locations           = treeService.pathNames(scope.locationPath);
        }

      }
    }


  }])
  .directive('categorySelector',['treeService', function (treeService) {

    return {
      restrict:'E',
      scope:{
        categoryPath:'=',
        categorySelected:'=',
        isReady:'=',
        inEditMode:'=',
        model:'=',
        categories:'=',
        redefineCategory:'='
      },
      template:'' +
      '<div class="panel panel-default" ng-show="categorySelected === false && isReady">'+
        '<div class="panel-heading">'+
          '<h3 class="panel-title" ng-switch="inEditMode">'+
            '<span ng-switch-when="false" >New Publication - Select a category:</span>'+
            '<span ng-switch-when="true">Edit Publication</span>'+
          '</h3>'+
        '</div>'+
        '<div class="list-group">'+
          '<button type="button" class="list-group-item" ng-click="setCategory(category.$id)" ng-repeat="category in categories | filter:{parentId: model.categoryId}:true" >' +
            '<i style="color: #286090" class="fa" ng-class="{\'fa-folder\': (category.name !== \'Marketplace\' && category.name !== \'Jobs\' && category.name !== \'Real Estate\' && category.name !== \'Transport\' && category.name !== \'Services\') , \'fa-shopping-cart\': (category.name === \'Marketplace\') , \'fa-suitcase\': (category.name === \'Jobs\'), \'fa-home\': (category.name === \'Real Estate\'), \'fa-car\': (category.name === \'Transport\'), \'fa-wrench\' : (category.name === \'Services\')}"></i> '+
            '{{category.name | capitalizeFirstChar}}'+
          '</button>'+
        '</div>'+
        '<div class="panel-body">'+
          '<ol ng-show="categoryPath.length > 0" class="breadcrumb" style="margin-bottom: 7px;">'+
            '<li ng-click="model.categoryId = \'\'; categoryPath =[];" class="a-link"> Reset </li>'+
            '<li ng-repeat="category in categoryPath" ng-click="setCategory(category.$id)" ng-class="{\'a-link\': !$last}"> {{category.name | capitalizeFirstChar}} </li>'+
          '</ol>'+
          '<div ng-show="redefineCategory === true" class="alert alert-danger alert-xs" style="margin-bottom: 10px;" role="alert"><b>NOTE: Sorry, but we need to redefine the category.</b></div>'+
          '<div class="alert alert-info alert-xs" style="margin-bottom: 0;" role="alert">NOTE: Select the category that best suits to the publication. No matter if it is too general or specific, the important thing is to select one.</div>'+
        '</div>'+
        '<div class="panel-footer" style="text-align: right;">'+
          '<button ng-click="categorySelected = true; redefineCategory = false" type="button" class="btn btn-primary" ng-disabled="model.categoryId ===\'\'" >'+
            '<i class="fa fa-check"></i> Confirm selection' +
          '</button>'+
        '</div>'+
      '</div>',
      link:function(scope){

        scope.setCategory = function (categoryId) {
          scope.model.categoryId           = categoryId;
          scope.categoryPath                       = treeService.getPath(categoryId,scope.categories);
          scope.model.categories           = treeService.pathNames(scope.categoryPath);
          scope.model.department           = (scope.categoryPath[0]) ? scope.categoryPath[0].name : ''; // $filter('camelCase')($scope.publication.categoryPath[0].name)
        };

      }

    }

  }])
  .directive('descriptionInput',['$filter',function ($filter) {

    return {
      restrict:'E',
      scope:{
        formName:'=',
        model:'='
      },
      template:''+
      '<div class="form-group">'+
        '<label class="control-label"><span class="glyphicon glyphicon-book"></span> Description <sup style="color: red;">*</sup></label>'+
        '<textarea redactor name="htmlDescription" data-ng-model="model.htmlDescription" required class="form-control" placeholder=""></textarea>'+
        '<div data-ng-messages="formName.$submitted && formName.htmlDescription.$error" class="help-block">'+
          '<div data-ng-message="required" >'+
          '- The <b>description</b> is required.'+
          '</div>'+
        '</div>'+
      '</div>',
      link:function(scope){

        scope.$watch(function(scope){
          return scope.model.htmlDescription;
        },function(){
          scope.model.description = $filter('htmlToPlaintext')(scope.model.htmlDescription);
        });

      }

    };

  }])
  .directive('warrantyInput',['$filter',function ($filter) {

    return {
      restrict:'E',
      scope:{
        formName:'=',
        model:'='
      },
      template:''+
      '<div class="form-group">'+
        '<label class="control-label"><i class="fa fa-certificate"></i> Warranty <sup style="color: red;">*</sup></label>'+
        '<textarea redactor name="htmlWarranty" data-ng-model="model.htmlWarranty" required class="form-control" placeholder=""></textarea>'+
        '<div data-ng-messages="formName.$submitted && formName.htmlWarranty.$error" class="help-block">'+
          '<div data-ng-message="required" >'+
            '- The <b>Warranty</b> is required.'+
          '</div>'+
        '</div>'+
      '</div>',
      link:function(scope){

        scope.$watch(function(scope){
          return scope.model.htmlWarranty;
        },function(){
          scope.model.warranty = $filter('htmlToPlaintext')(scope.model.htmlWarranty);
        });

      }

    };

  }])
  .directive('titleInput',['$filter',function ($filter) {

    return {
      restrict:'E',
      scope:{
        formName:'=',
        model:'='
      },
      template:''+
      '<div class="form-group">'+
        '<label class="control-label"><span class="glyphicon glyphicon-bookmark"></span> Title <sup style="color: red;">*</sup></label>'+
        '<input type="text" name="title" ng-model="model.title" required minlength="7" capitalize-first-char class="form-control" placeholder="">'+
        '<div data-ng-messages="formName.$submitted && formName.title.$error" class="help-block">'+
          '<div data-ng-message="required">'+
            '- The <b>title</b> is required.'+
          '</div>'+
          '<div data-ng-message="minlength" >'+
           '- The <b>title</b> must be at least 7 characters long.'+
          '</div>'+
        '</div>'+
      '</div>'
    };

  }])
  .directive('quantityInput',[function () {

    return {
      restrict:'E',
      scope:{
        formName:'=',
        model:'='
      },
      template:''+
      '<div class="form-group" >'+
        '<div class="row">'+
          '<div class="col-xs-12 col-sm-12 col-md-5">'+
            '<label class="control-label"><i class="fa fa-cubes"></i> Quantity in stock <sup style="color: red;">*</sup></label>'+
              '<div class="input-group">'+
                '<div class="input-group-addon">Units</div>'+
                '<input name="quantity" ng-model="model.quantity" required class="form-control" placeholder="Eje: 100" type="number">'+
              '</div>'+
            '<div data-ng-messages="formName.$submitted && formName.quantity.$error" class="help-block">'+
              '<div data-ng-message="required">'+
                '- The <b>quantity</b> is required.'+
              '</div>'+
            '</div>'+
          '</div>'+
        '</div>'+
      '</div>'
    };

  }])
  .directive('priceInput',[function () {

    return {
      restrict:'E',
      scope:{
        formName:'=',
        model:'='
      },
      template:''+
      '<div class="form-group" >'+
        '<div class="row">'+
          '<div class="col-xs-12 col-sm-12 col-md-5">'+
            '<label class="control-label"><span class="glyphicon glyphicon-tag"></span> Price <sup style="color: red;">*</sup></label>'+
            '<div class="input-group">'+
              '<div class="input-group-addon">£</div>'+
              '<input name="price" ng-model="model.price" required class="form-control" placeholder="Eje: 1000" type="number">'+
            '</div>'+
            '<div data-ng-messages="formName.$submitted && formName.price.$error" class="help-block">'+
              '<div data-ng-message="required">'+
                '- The <b>price</b> is required.'+
              '</div>'+
            '</div>'+
          '</div>'+
        '</div>'+
      '</div>'
    };

  }])
  .directive('jobTypeSelect',[function () {

    return {
      restrict:'E',
      scope:{
        model:'='
      },
      template:''+
      '<hr class="hr-xs">'+

      '<label><i class="fa fa-random"></i> Job type</label>'+
      '<div class="row" style="margin-bottom: 10px;">'+
        '<div class="col-xs-12 col-sm-12 col-md-5">'+
          '<select class="form-control" ng-model="model.jobType">'+
            '<option ng-repeat="type in jobTypes" value="{{type}}">{{type}}</option>'+
          '</select>'+
        '</div>'+
      '</div>',
      link:function(scope){

        if (typeof scope.model.jobType === 'undefined'){
          scope.model.jobType = 'Permanent';
        }

        scope.jobTypes = [
          'Permanent',
          'Contract'
        ];

      }
    }

  }])
  .directive('salaryInput',[function () {

    return {
      restrict:'E',
      scope:{
        formName:'=',
        model:'='
      },
      template:'' +
      '<hr class="hr-xs">'+

      '<div class="row">'+
        '<div class="col-xs-12 col-sm-12 col-md-5">'+

          '<label><i class="fa fa-gbp"></i> Salary</label>'+
          '<div style="margin-bottom: 10px;">'+
            '<select class="form-control" ng-model="model.jobSalaryType">'+
              '<option ng-repeat="salaryType in jobSalaryTypes" value="{{salaryType}}"> {{salaryType}} </option>'+
            '</select>'+
          '</div>'+

          '<label><i class="fa fa-gbp"></i> From:</label>'+
          '<div class="form-group" style="margin-bottom: 10px;">'+
            '<input name="jobSalaryStartAt" ng-model="model.jobSalaryStartAt" required class="form-control" placeholder="<Base salary or start at>" type="number">'+
          '</div>'+
          '<div data-ng-messages="(formName.$submitted && formName.jobSalaryStartAt.$error) || (formName.jobSalaryStartAt.$dirty && formName.jobSalaryStartAt.$error)" class="help-block">'+
            '<div data-ng-message="required">'+
              '- The <b>start or base salary</b> is required.'+
            '</div>'+
          '</div>'+

          '<label><i class="fa fa-gbp"></i> To:</label>'+
          '<div class="form-group" style="margin-bottom: 10px;">'+
            '<input name="jobSalaryEndAt" ng-model="model.jobSalaryEndAt" required class="form-control" placeholder="<End at>" type="number">'+
          '</div>'+
          '<div data-ng-messages="(formName.$submitted && formName.jobSalaryEndAt.$error) || (formName.jobSalaryEndAt.$dirty && formName.jobSalaryEndAt.$error)" class="help-block">'+
            '<div data-ng-message="required">'+
              '- The <b> max salary </b> is required.'+
            '</div>'+
          '</div>'+

          '<div class="checkbox">'+
            '<label>'+
              '<input ng-model="model.jobHasBonus" type="checkbox"> The job Has Bonus?'+
            '</label>'+
          '</div>'+

          '<div class="checkbox" style="margin-bottom: 0;">'+
            '<label>'+
              '<input ng-model="model.jobHasBenefits" type="checkbox"> The job Has Benefits?'+
            '</label>'+
          '</div>'+

        '</div>'+
      '</div>',
      link:function(scope){

        if (typeof scope.model.jobSalaryStartAt === 'undefined'){
          scope.model.jobSalaryStartAt = null;
        }
        if (typeof scope.model.jobSalaryEndAt === 'undefined'){
          scope.model.jobSalaryEndAt = null;
        }
        if (typeof scope.model.jobHasBonus === 'undefined'){
          scope.model.jobHasBonus = false;
        }
        if (typeof scope.model.jobHasBenefits === 'undefined'){
          scope.model.jobHasBenefits = false;
        }
        if (typeof scope.model.jobSalaryType === 'undefined'){
          scope.model.jobSalaryType = 'Annual';
        }

        scope.jobSalaryTypes = [
          'Annual',
          'Daily',
          'Hourly'
        ];

        function setEstimatedMonthlySalary (){
          switch(scope.model.jobSalaryType) {
            case 'Annual':
              scope.model.jobEstimatedMonthlySalary = (scope.model.jobSalaryStartAt / 12);
              break;
            case 'Daily':
              scope.model.jobEstimatedMonthlySalary = (scope.model.jobSalaryStartAt * 21.741);
              break;
            case 'Hourly':
              scope.model.jobEstimatedMonthlySalary = (scope.model.jobSalaryStartAt * 8 * 21.741);
              break;
          }
        }

        scope.$watch(function(scope){
          return scope.model.jobSalaryType;
        },function(){
          setEstimatedMonthlySalary()
        });

        scope.$watch(function(scope){
          return scope.model.jobSalaryStartAt;
        },function(){
          setEstimatedMonthlySalary()
        });


      }
    }

  }])
  .directive('recruiterTypesSelect',[function () {

    return {
      restrict:'E',
      scope:{
        model:'='
      },
      template:''+
      '<hr class="hr-xs">'+

      '<label><i class="fa fa-random"></i> Recruiter type</label>'+
        '<div class="row" style="margin-bottom: 10px;">'+
        '<div class="col-xs-12 col-sm-12 col-md-5">'+
          '<select class="form-control" ng-model="model.jobRecruiterType">'+
            '<option ng-repeat="type in recruiterTypes" value="{{type}}">{{type}}</option>'+
          '</select>'+
        '</div>'+
      '</div>',
      link:function(scope){

        if (typeof scope.model.jobRecruiterType === 'undefined'){
          scope.model.jobRecruiterType = 'Agency';
        }

        scope.recruiterTypes = [
          'Agency',
          'Direct Employer'
        ];

      }
    }

  }])
  .directive('reHomeStatus',[function () {

    return {
      restrict:'E',
      scope:{
        model:'='
      },
      template:''+
      '<hr class="hr-xs">'+

      '<label><i class="fa fa-random"></i> Home status</label>'+
        '<div class="row" style="margin-bottom: 10px;">'+
        '<div class="col-xs-12 col-sm-12 col-md-5">'+
          '<select class="form-control" ng-model="model.reHomeStatus">'+
            '<option ng-repeat="option in options" value="{{option}}">{{option}}</option>'+
          '</select>'+
        '</div>'+
      '</div>',
      link:function(scope){

        if (typeof scope.model.reHomeStatus === 'undefined'){
          scope.model.reHomeStatus = 'New';
        }

        scope.options = [
          'New',
          'Refurbished',
          'Used'
        ];

      }
    }

  }])
  .directive('reHomeFor',[function () {

    return {
      restrict:'E',
      scope:{
        model:'='
      },
      template:''+
      '<hr class="hr-xs">'+

      '<label><i class="fa fa-random"></i> Home for</label>'+
        '<div class="row" style="margin-bottom: 10px;">'+
        '<div class="col-xs-12 col-sm-12 col-md-5">'+
          '<select class="form-control" ng-model="model.reHomeFor">'+
            '<option ng-repeat="option in options" value="{{option}}">{{option}}</option>'+
          '</select>'+
        '</div>'+
      '</div>',
      link:function(scope){

        if (typeof scope.model.reHomeFor === 'undefined'){
          scope.model.reHomeFor = 'Sale';
        }

        scope.options = [
          'Sale',
          'Rent'
        ];

      }
    }

  }]);