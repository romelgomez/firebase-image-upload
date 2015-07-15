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
  .controller('PublicationsController',['$scope','tree','notificationService','$filter','$log',function($scope,tree,notificationService,$filter,$log){

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
      category:     '',
      title:        null,
      description:  null,
      price:        null,
      quantity:     null
    });

    $scope.reset = function(){
      $scope.model = angular.copy(original);
      $scope.form.$setUntouched();
      $scope.form.$setPristine();
    };

    /**
     @Name
     @Description
     @parameters
     @returns
     */
    $scope.submit = function () {
      if($scope.form.$valid){

        $log.log('$scope.model',$scope.model);

        //$scope.httpRequestPromise = $scope.nodes.$add(node).then(function() {
        //  notificationService.success('Data has been saved to our Firebase database');
        //  $scope.reset();
        //},function(error){
        //  notificationService.error(error);
        //  //$window.location = '/';
        //});

      }
    };

    var key = '';

    $scope.save = function(validate){

      // snapshots of publications
      // releases

      // [snapshots] luego de presionar <Publish>, y cada vez que el vendedor presione el botón <Update>, se crea una instantánea de la publicación.
      // Cuando el cliente confirma el contrato, lo hará sobre la última instantánea guardada. El comprador tendrá derechos y deberes según
      // lo especifique la instantánea. Si el vendedor luego modifica la publicación, estará creado otra instantánea o contrato.
      //
      // Las modificaciones realizadas a la publicación se reflejarán en todos los clientes que la estén visualizando, tan rápido como la
      // latencia de la conexión de internet lo permita.
      //
      // <Update> <Pause or Enable> <Delete>
      // <Publish> <Save> <Discard>
      //
      // Publish & Update  -> validate = true;  Valida que las fotos y los campos del formulario esten completos
      // Save              -> validate = false; Toma lo que este al momento y guarda
      // Pause             -> actualiza un campo
      // Enable            -> actualiza un campo
      // Delete            -> actualiza un campo
      // Discard           -> actualiza un campo

      // publications           snapshots

      // category               category
      // userId                 userId
      // title                  title
      // description            description
      // price                  price
      // quantity               quantity
      // barcode                barcode
      // warranty               warranty
      //                        termsOfService
      // paused                                     true or false
      // released                                   true or false
      // deleted                                    true or false
      // created  (draft)       created (released)             Firebase.ServerValue.TIMESTAMP

      //var function

      if(validate){
        if($scope.form.$valid){
          // update
        }
      }else{
        if(key === ''){
          // add a new record
        }else{
          // update
        }
      }

      //timestamp: Firebase.ServerValue.TIMESTAMP
    };


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



  }]);
