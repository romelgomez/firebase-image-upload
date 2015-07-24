'use strict';

// añadir soporte a otro tipo de publicación

angular.module('publications',['tree','filters','uuid','ngMessages','angular-redactor'])
  .factory('publicationsService',['$q','$window','rfc4122','FireRef','$firebaseArray',function($q,$window,rfc4122,FireRef,$firebaseArray){

    var publications = $firebaseArray(FireRef.child('publications'));

    return {
      publications: publications,
      updateRecord: function (recordKey,model){
        var record = publications.$getRecord(recordKey);
        angular.forEach(model,function(value,key){
          if(key === 'releaseDate'){
            record[key] = (record[key]) ? record[key] : $window.Firebase.ServerValue.TIMESTAMP;
          }else{
            record[key] = value;
          }
        });
        return publications.$save(record);
      },
      newKey: function(){
        return publications.$add({uuid:rfc4122.v4()});
      }
  };

  }])
  .controller('PublicationsController',['$scope','$q','tree','publicationsService','notificationService','$filter','$log',function($scope,$q,tree,publicationsService,notificationService,$filter,$log){

    //Main Categories [market, jobs] // realEstate, vehicles, boats, planes, stockMarket

    $scope.treeNodes          = tree.nodes();
    $scope.categoryExpected   = false;
    $scope.path               = [];
    $scope.model = {
      userId:       '1',
      categoryId:   '',
      type:         '',
      title:        '',
      description:  '',
      price:        null,
      quantity:     null,
      barcode:      '',
      warranty:     '',
      releaseDate:  '',
      paused:       false,
      deleted:      false
    };

    $scope.httpRequestPromise = $scope.treeNodes.$loaded(null,function(error){
      notificationService.error(error);
    });

    $scope.setCategory = function (categoryId) {
      $scope.model.categoryId = categoryId;
      $scope.path             = tree.getPath(categoryId,$scope.treeNodes);
      $scope.model.type       = ($scope.path[0]) ? $filter('camelCase')($scope.path[0].name): '';
    };

    var recordKey;

    $scope.submit = function(){
      if($scope.form.$valid){
        if(recordKey){
          $scope.httpRequestPromise = publicationsService.updateRecord(recordKey,$scope.model)
            .then(function() {
              notificationService.success('Data has been save to our Firebase database');
            });
        }else{
          $scope.httpRequestPromise = publicationsService.newKey()
            .then(function(ref){
              recordKey = ref.key();
              return publicationsService.updateRecord(recordKey,$scope.model);
            })
            .then(function() {
              notificationService.success('Data has been save to our Firebase database');
            },function(error){
              notificationService.error(error);
            });
        }
      }
    };


  }])
  .directive('ngDropZone', ['$window','$log',function ($window,$log) {


    //myDropzone.on("addedfile", function(file) {
    //  file.previewElement.addEventListener("click", function() {
    //    myDropzone.removeFile(file);
    //  });
    //});

    var controller = function ($scope){

      $scope.firstFiles = function(){
         $log.log('ok');
      };

      //$scope.continueUpload   = false;
      //$scope.uploadAllButton  = false;

      $scope.dropZoneConfig = {
        options: {
          url: 'upload.php',
          previewsContainer: '#previews',  // Define the container to display the previews
          clickable: '.clickable',         // Define the element that should be used as click trigger to select files.
          paramName: 'image',              // The name that will be used to transfer the file
          maxFilesize: 10,                 // MB
          acceptedFiles: 'image/*',
          autoQueue: false,
          //previewTemplate: layout,
          init: function() {

            $scope.$watch(function(scope) { return scope.dropZoneInstance; },
              function() {
                //$log.log('$scope.dropZone ',$scope.dropZoneInstance);

              }
            );

          }
        },
        eventHandlers: {
          'addedfile': function (file) {

            //$scope.firstFiles();
            //$log.log('getFilesWithStatus',$scope.dropZoneInstance.getFilesWithStatus(Dropzone.ADDED));
            //removeButton(myDropzone,file);


          },
          'sending': function (file, xhr, formData) {
            //formData.append("product_id", $('#ProductId').val());
          },
          'success': function (file, response) {
          },
          'error': function (file, error, response) {
          }
        }
      };

    };

    return {
      restrict: 'AE',
      templateUrl: 'dropZoneTemplate.html',
      transclude: true,
      scope: {
        dropZoneInstance: '=',
        dropZoneConfig: '='
      },
      controller:controller,
      link: function(scope, element) {
        if(!angular.isDefined($window.Dropzone)){ throw new Error('DropZone.js not loaded.'); }

        scope.dropZoneConfig = {
          options: angular.isDefined(scope.dropZoneConfig.options) ? scope.dropZoneConfig.options : {},
          eventHandlers: angular.isDefined(scope.dropZoneConfig.eventHandlers) ? scope.dropZoneConfig.eventHandlers : {}
        };

        var dropZoneInstance = new $window.Dropzone(element[0], scope.dropZoneConfig.options);

        angular.forEach(scope.dropZoneConfig.eventHandlers, function (handler, event) {
          dropZoneInstance.on(event, handler);
        });

        scope.dropZoneInstance = dropZoneInstance;
      }
    };
  }]);


/*

 snapshots of publications
 releases

 cuando el usuario confirma la compra se crea un instantánea de todos los datos.


 [snapshots] luego de presionar <Publish>, y cada vez que el vendedor presione el botón <Update>, se crea una instantánea de la publicación.
 Cuando el cliente confirma el contrato, lo hará sobre la última instantánea guardada. El comprador tendrá derechos y deberes según
 lo especifique la instantánea. Si el vendedor luego modifica la publicación, estará creado otra instantánea o contrato.

 Las modificaciones realizadas a la publicación se reflejarán en todos los clientes que la estén visualizando, tan rápido como la
 latencia de la conexión de internet lo permita.

 <Update> <Pause or Enable> <Delete>
 <Publish> <Discard>

 Publish & Update  -> validate = true;  Valida que las fotos y los campos del formulario esten completos
 Save              -> validate = false; Toma lo que este al momento y guarda
 Pause             -> actualiza un campo
 Enable            -> actualiza un campo
 Delete            -> actualiza un campo
 Discard           -> actualiza un campo

 publications           snapshots

 category               category
 user
 title                  title
 description            description
 price                  price
 quantity               quantity
 barcode                barcode
 warranty               warranty

 paused                                     true or false
 releaseDate                                Firebase.ServerValue.TIMESTAMP
 deleted                                    true or false
 created  (draft) created (released)        Firebase.ServerValue.TIMESTAMP

 termsOfService

 Main Categories [Market, Jobs] // Real Estate, Vehicles, Boats, Planes, stock market

 <publications> Market

 userId                 string
 categoryId             string
 title                  string
 description            string
 price                  int
 quantity               int
 barcode                string
 warranty               string
 releaseDate            date
 paused                 boolean
 deleted                boolean

 <publications> Jobs

 userId                 string
 categoryId             string
 title                  string
 description            string
 salary
 barcode                string
 releaseDate            date
 paused                 boolean
 deleted                boolean



 */
