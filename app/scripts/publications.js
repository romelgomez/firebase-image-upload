'use strict';

// definir el type de publication
// añadir soporte a otro tipo de publicación

angular.module('publications',['tree','filters','uuid','ngMessages','angular-redactor'])
  .factory('publicationsService',['$q','rfc4122','FireRef','$firebaseArray','notificationService','$filter','$log',function($q,rfc4122,FireRef,$firebaseArray,notificationService,$filter,$log){

    var publications = $firebaseArray(FireRef.child('publications'));

    return {
      publications: publications,
      updateRecord: function (recordKey,model){
        var record = publications.$getRecord(recordKey);
        angular.forEach(model,function(value,key){
          record[key] = value;
        });
        publications.$save(record).then(function() {
          notificationService.success('Data has been save to our Firebase database');
        });
      },
      newKey: function(){
        var deferred = $q.defer();
        var promise = deferred.promise;
        publications.$add({uuid:rfc4122.v4()}).then(function(ref){
          deferred.resolve(ref.key());
        },function(error){
          deferred.reject(error);
        });
        return promise;
      }
  };

  }])
  .controller('PublicationsController',['$scope','$q','tree','publicationsService','notificationService','$filter','$log','$firebaseArray','FireRef',function($scope,$q,tree,publicationsService,notificationService,$filter,$log,$firebaseArray,FireRef){

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
          publicationsService.updateRecord(recordKey,$scope.model);
        }else{
          publicationsService.newKey().then(function(key){
            recordKey = key;
            publicationsService.updateRecord(key,$scope.model);
          });
        }
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
