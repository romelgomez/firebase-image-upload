'use strict';

angular.module('publications',['tree','filters','ngMessages','angular-redactor'])
  .factory('publicationsService',['$q','FireRef','$firebaseArray','notificationService','$filter',function($q,FireRef,$firebaseArray,notificationService,$filter){


    return {
      publications: function (type) {

        //if

        return $firebaseArray(FireRef.child('publications').child(type));
      },
      //getRecord: function (key){
      //  return publications.$getRecord(key);
      //},
      getKey: function(){
        var deferred = $q.defer();
        var promise = deferred.promise;
        publications.$add({}).then(function(ref) {
          var key = ref.key();
          deferred.resolve(key);
        },function(error){
          deferred.reject(error);
        });
        return promise;
      }
  };

  }])
  .controller('PublicationsController',['$scope','$q','tree','publicationsService','notificationService','$filter','$log',function($scope,$q,tree,publicationsService,notificationService,$filter,$log){

    $scope.treeNodes          = tree.nodes();
    $scope.categoryExpected   = false;
    $scope.path               = [];
    $scope.model = {
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
    };

    var key = '';

    //var publications = publicationsService.publications();

    //$scope.publications = publications;

    $scope.httpRequestPromise = $scope.treeNodes.$loaded(null,function(error){
      notificationService.error(error);
    });

    //$scope.httpRequestPromise = publications.$loaded(null,function(error){
    //  notificationService.error(error);
    //});

    $scope.setCategory = function (categoryId) {
      $scope.model.categoryId = categoryId;
      $scope.path             = tree.getPath(categoryId,$scope.treeNodes);
    };


    //var save = function(record){
    //  publications.$save(record).then(function() {
    //    notificationService.success('Data has been save to our Firebase database');
    //  },function(error){
    //    notificationService.error(error);
    //  });
    //};

//    var setRecord = function(key){
//      /*
//       Returns the record from the array for the given key. If the key is not found, returns null. This method utilizes $indexFor(key) to find the appropriate record.
//
//       var list = $firebaseArray(ref);
//       var rec = list.$getRecord("foo"); // record with $id === "foo" or null
//     */
//*
//      var record = publications.$getRecord(key);
//
//      /*
//        existen diferente modelos
//        el modelo de mercado es diferente del modelo para cargar las ofertas de trabajo.
//     */
//
//      $scope.model = {
//        userId:       null,
//        categoryId:   null,
//        title:        null,
//        description:  null,
//        price:        null,
//        quantity:     null,
//        barcode:      null,
//        warranty:     null,
//        releaseDate:  null,
//        paused:       null,
//        deleted:      null
//      };
//
//      record.userId         = $scope.model.userId;
//      record.categoryId     = $scope.model.categoryId;
//      record.title          = $scope.model.title;
//      record.description    = $scope.model.description;
//      record.price          = $scope.model.price;
//      record.quantity       = $scope.model.quantity;
//      record.barcode        = $scope.model.barcode;
//      record.warranty       = $scope.model.warranty;
//      record.releaseDate    = (record.releaseDate) ? record.releaseDate:  Firebase.ServerValue.TIMESTAMP;
//      record.paused         = $scope.model.paused;
//      record.deleted        = $scope.model.deleted;
//
//    };

    //var getRecord = function (id){
    //  return publications.$getRecord(id);
    //};

    //var category = function (){
    //  this.category       = "-JuRf94Wkek95szSUwBc";
    //  this.categoryId     = 7;
    //  this.userId         = 7;
    //  this.$id            = "-JuSLL6XgFMeG6VDtKb9";
    //  this.$priority      = null;
    //};

    //$scope.saveCustom =function(){
    //  var custom = {
    //    $$hashKey: "object:20",
    //    "category": "-JuRf94Wkek95szSUwBc",
    //    "categoryId": 77,
    //    "userId": 656546,
    //    "$id": "-JuSLL6XgFMeG6VDtKb9",
    //    "$priority": null
    //  };
    //
    //  var record =  getRecord(custom.$id);
    //  //$log.log('custom', custom);
    //  //$log.log('record',record);
    //
    //  record.categoryId = 32132151321513215;
    //
    //  publications.$save(record).then(function() {
    //    notificationService.success('Data has been save to our Firebase database');
    //  },function(error){
    //    notificationService.error(error);
    //  });
    //
    //};
    //
    //
    //$scope.submit = function(){
    //  if($scope.form.$valid){
    //    if(key){
    //    }else{
    //      getKey().then(setRecord(key),function(error){
    //        notificationService.error(error);
    //      })
    //
    //    }
    //  }
    //};

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

 if(validate){
 }else{
 if(id === ''){
 $scope.httpRequestPromise = publications.$add($scope.model).then(function(ref) {
 key = ref.key();
 notificationService.success('Data has been saved to our Firebase database');
 },function(error){
 notificationService.error(error);
 });
 // add a new record
 }else{

 }
 }


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
