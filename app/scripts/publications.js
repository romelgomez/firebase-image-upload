'use strict';

angular.module('publications',['tree','filters'])
  .controller('PublicationsController',['$scope','tree','notificationService','$filter',function($scope,tree,notificationService,$filter){

    $scope.nodes = tree.nodes();

    $scope.httpRequestPromise = $scope.nodes.$loaded(null,function(error){
      notificationService.error(error);
    });

    $scope.getChildren = function(nodeId){
      var children = [];
      angular.forEach($scope.nodes,function(node){
        if(node.parentId === nodeId){
          children.push(node);
        }
      });
      return children;
    };

    $scope.category = '';

    $scope.categoryExpected = false;

    $scope.path = [];

    $scope.setCategory = function (categoryId) {
      $scope.category = categoryId;

      $scope.path = getPath(categoryId);
    };

    var getPath = function (categoryId){
      var path = [];
      var nodes   = $filter('reverse')($scope.nodes);
      var proces = function (nodeId){
        angular.forEach(nodes,function(node){
          if(nodeId === node.$id){
            path.push(node);
            if(node.parentId !== ''){
              proces(node.parentId);
            }
          }
        });
      };
      proces(categoryId);
      return $filter('reverse')(path);
    };


    /*
     FORMA EN QUE AÑADO active A LA CATEGORIA SELECIONADA
     un array, formado por todos los id de la categorias selecionadas.

     al selecionar una categoria tengo que armar un array, con todos los ancentros de tal categoria, este array sera usado para definir el path

     para activar la clase active en una categoria, ng-class="{active:isSelected(node.id)}"

     isSelected hara uso del array que almacena las id selecionadas. si existe tal id retornara true.

     FORMA EN QUE MUESTRO LAS CATEGORIAS
     defino una variable: var categpria. esta variable sera al principo una cadena vacia,

     <button type="button" class="list-group-item" ng-repeat="node in nodes | filter:{parentId:''}:true" >{{node.name | capitalizeFirstChar}}</button>

     en el filtro  parentId debe hacer referencia a una variable, esta variable almacena el id de la categoria seleccionada. haciendo que solo se muestren
     las categorias hijas o categorias de pendientes de la categoria selecionada.

     el usuario podra selecionar cualquier categoria, si importar el nivel, se le llama a eso, selección floja, ya que puede suceder que las definiciones existente
     no encajen con la publicaion o el producto, por lo tanto, con tal que se seccione una esta bien, ya que se espera que seleciona una categoria muy general donde
     si encaje la publicación.

     si la categoria actual selecioanda no tiene hijos el bloque donde se muestra las categorias no desaparece
     */


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
