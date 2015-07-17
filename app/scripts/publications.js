'use strict';

angular.module('publications',['tree','filters','ngMessages','angular-redactor'])
  .factory('publicationsService',['$q','FireRef','$firebaseArray','notificationService','$filter',function($q,FireRef,$firebaseArray,notificationService,$filter){

    var publicationsRef = function(){
      return FireRef.child('publications');
    };

    return {
      publications: function () {
        return $firebaseArray(publicationsRef());
      }
    };

  }])
  .controller('PublicationsController',['$scope','tree','publicationsService','notificationService','$filter','$log',function($scope,tree,publicationsService,notificationService,$filter,$log){

    $scope.treeNodes = tree.nodes();

    $scope.httpRequestPromise = $scope.treeNodes.$loaded(null,function(error){
      notificationService.error(error);
    });

    $scope.categoryExpected = false;

    $scope.path = [];

    $scope.setCategory = function (categoryId) {
      $scope.model.category = categoryId;
      $scope.path           = tree.getPath(categoryId,$scope.treeNodes);
    };

    // id, user_id, title, body, 	price, quantity, status, published, banned, deleted, created, modified

    var original = angular.copy($scope.model = {
      userId:       null,
      categoryId:   null,
      title:        null,
      description:  null,
      price:        null,
      quantity:     null,
      barcode:      null,
      warranty:     null,
      releaseDate:  null,
      paused:       null,
      deleted:      null
    });

    $scope.reset = function(){
      $scope.model = angular.copy(original);
      $scope.form.$setUntouched();
      $scope.form.$setPristine();
    };

    var id = '';

    var publications = publicationsService.publications();

    $scope.httpRequestPromise = publications.$loaded(null,function(error){
      notificationService.error(error);
    });

    /**
     @Name
     @Description
     @parameters
     @returns
     */
    $scope.save = function(validate){

      //if(validate){
      //  if($scope.form.$valid){
      //    // update
      //    $scope.model.releaseDate = Firebase.ServerValue.TIMESTAMP;
      //
      //
      //  }
      //}else{
      //  if(id === ''){
      //    $scope.httpRequestPromise = publications.$add($scope.model).then(function(ref) {
      //      key = ref.key();
      //      notificationService.success('Data has been saved to our Firebase database');
      //    },function(error){
      //      notificationService.error(error);
      //    });
      //    // add a new record
      //  }else{
      //    // update
      //
      //    var record = publications.$getRecord(key);
      //
      //
      //
      //    publications.$save(record).then(function() {
      //      notificationService.success('Data has been update to our Firebase database');
      //    },function(error){
      //      notificationService.error(error);
      //    });
      //
      //  }
      //}

    };

  }]);



//    var messages = $FirebaseArray(ref);
//
//// add a new record to the list
//    messages.$add({
//      user: "physicsmarie",
//      text: "Hello world"
//    });
//
//// remove an item from the list
//    messages.$remove(someRecordKey);
//
//// change a message and save it
//    var item = messages.$getRecord(someRecordKey);
//    item.user = "alanisawesome";
//    messages.$save(item).then(function() {
//      // data has been saved to our database
//    });

//var publications = [
//  {
//    "left": 1,
//    "name": "321",
//    "parentId": "",
//    "right": 4,
//    "$id": "-Jtj9bAlDopYZTwv_PNU",
//    "$priority": null
//  },


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
