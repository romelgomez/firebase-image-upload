var firebase = require('./../fire');
var Q = require('q');
var uuid = require('uuid');

function slug(input) {
  return (!!input) ? String(input).toLowerCase().replace(/[^a-zá-źA-ZÁ-Ź0-9]/g, ' ').trim().replace(/\s{2,}/g, ' ').replace(/\s+/g, '-') : '';
}

function uniqueNameFor(obj, objID, path){
  return function (){
    var deferred = Q.defer();
    var slugPath = slug(obj.name.toLowerCase());
    console.log('slugPath:', slugPath);

    var uniqueParameterNames = firebase.FireRef.child('uniqueParameterNames/'+ path + '/' + slugPath );
    var objRef = firebase.FireRef.child(path + '/' + objID);

    uniqueParameterNames.once('value')
      .then(function(snapshot){
        if(snapshot.exists()){
          slugPath = slugPath + '-' + uuid.v1();
          uniqueParameterNames = firebase.FireRef.child('uniqueParameterNames/'+ path + '/' + slugPath );
        }

        obj.slug = slug(slugPath);
        return Q.all([objRef.set(obj), uniqueParameterNames.set(obj)]);
      })
      .then(function(){
        deferred.resolve();
      },function(error){
        deferred.reject(error);
      });

    return deferred.promise;
  };
}

function uniqueNamesFor(path){
  var deferred = Q.defer();
  var promises = [];

  firebase.FireRef.child(path).once('value')
    .then(function(snapshot){

      var objects = snapshot.val();

      for (var objID in objects) {
        if( objects.hasOwnProperty(objID) ) {
          promises.push(uniqueNameFor(objects[objID], objID,  path));
        }
      }

      deferred.resolve(promises);

    },function(error){
      deferred.reject(error);
    });

  return deferred.promise;
}

function processPromises (promises){
  var fire = function () {
    return promises.length && promises.shift()()
        .then(function () {
          return fire();
        });
  };
  // Begin the queue
  return fire();
}

function unique (name){
  var deferred = Q.defer();

  firebase.FireRef.child('uniqueParameterNames').child(name).set(null);
  uniqueNamesFor(name)
    .then(function(promises){
      return processPromises(promises)
    })
    .then(function(){
      deferred.resolve();
    },function(error){
      deferred.reject(error);
    });

  return deferred.promise;
}


function main(){

  Q.all([
      unique('locations'),
      unique('categories')
    ])
    .then(function(){
      console.log('The process has finished with success!');
      process.exit();
    },function(error){
      console.log(error);
    });

}

main();