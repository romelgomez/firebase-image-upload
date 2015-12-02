//https://www.algolia.com/doc/tutorials/firebase-algolia#Introduction

var Firebase = require('firebase');
var algoliasearch = require('algoliasearch');
var Q = require('q');
var client = algoliasearch('FU6V8V2Y6Q', '1d84a9feb84aaff718e378e7dc66efef');
var index = client.initIndex('publications');

var publicationsRef = new Firebase('berlin.firebaseio.com/publications');

// Listen for changes to Firebase data
publicationsRef.on('child_added', function(dataSnapshot){

  console.log('-------------------------------------------');
  console.log('START ADD OR UPDATE OBJECT');

  addOrUpdateObject(dataSnapshot)
    .then(function(content){
      console.log('-------------------------------------------');
      console.log('CONTENT ADDED OR UPDATED:');
      console.log(content);
    },function(error){
      throw error;
    });
});

publicationsRef.on('child_changed', function(dataSnapshot){

  console.log('-------------------------------------------');
  console.log('START ADD OR UPDATE OBJECT');

  addOrUpdateObject(dataSnapshot)
    .then(function(content){
      console.log('-------------------------------------------');
      console.log('CONTENT ADDED OR UPDATED:');
      console.log(content);
    },function(error){
      throw error;
    });
});

publicationsRef.on('child_removed', function(dataSnapshot){

  console.log('-------------------------------------------');
  console.log('START REMOVE OBJECT');

  removeIndex(dataSnapshot)
    .then(function(content){
      console.log('-------------------------------------------');
      console.log('CONTENT REMOVED:');
      console.log(content);
    },function(error){
      throw error;
    });
});

function addOrUpdateObject(dataSnapshot){
  var deferred = Q.defer();
  // Get FireBase object
  var fireBaseObject = dataSnapshot.val();

  // Specify Algolia's objectID using the FireBase object key
  fireBaseObject.objectID = dataSnapshot.key();

  // Add or update object
  index.saveObject(fireBaseObject, function(error, content) {
    if (error) {
      deferred.reject(error);
    }else{
      deferred.resolve(content);
    }
  });

  return deferred.promise;
}

function removeIndex(dataSnapshot) {
  var deferred = Q.defer();

  // Specify Algolia's objectID using the Firebase object key
  var objectID = dataSnapshot.key();

  // Add or update object
  index.deleteObject(objectID, function(error, content) {
    if (error) {
      deferred.reject(error);
    }else{
      deferred.resolve(content);
    }
  });

  return deferred.promise;
}

/*
[
  {
    "name": "Monica Bellucci",
    "alternative_name": "Monica Anna Maria Bellucci",
    "rating": 3956,
    "image_path": "/z3sLuRKP7hQVr.jpg"
  },
  {
    "name": "Sean Connery",
    "alternative_name": "Sir Sean Connery",
    "rating": 746,
    "image_path": "/ce84udJZ9QRSR44jxwK2apM3DM8.jpg"
  },
  {
    "name": "Will Smith",
    "alternative_name": null,
    "rating": 492,
    "image_path": "/2iYXDlCvLyVO49louRyDDXagZ0G.jpg"
  },
  {...}
]
*/