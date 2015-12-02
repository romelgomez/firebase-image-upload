//https://www.algolia.com/doc/tutorials/firebase-algolia#Introduction

var Firebase = require('firebase');
var algoliasearch = require('algoliasearch');
var Q = require('q');
var client = algoliasearch('FU6V8V2Y6Q', '1d84a9feb84aaff718e378e7dc66efef');
var index = client.initIndex('publications');

var publicationsRef = new Firebase('berlin.firebaseio.com/publications');

// Listen for changes to Firebase data
publicationsRef.on('child_added', addOrUpdateObject);
publicationsRef.on('child_changed', addOrUpdateObject);
publicationsRef.on('child_removed', removeIndex);

function addOrUpdateObject(dataSnapshot){
  // Get FireBase object
  var fireBaseObject = dataSnapshot.val();

  // Specify Algolia's objectID using the FireBase object key
  fireBaseObject.objectID = dataSnapshot.key();

  // Add or update object
  index.saveObject(fireBaseObject, function(err, content) {
    if (err) {
      throw err;
    }else{
      console.log('-------------------------------------------');
      console.log('ADD OR UPDATED OBJECT ');
      console.log('CONTENT:', content);
    }
  });
}

function removeIndex(dataSnapshot) {
  // Get Firebase object
  var firebaseObject = dataSnapshot.val();

  // Specify Algolia's objectID using the Firebase object key
  var objectID = dataSnapshot.key();

  // Add or update object
  index.deleteObject(objectID, function(err, content) {
    if (err) {
      throw err;
    }else{
      console.log('-------------------------------------------');
      console.log('DELETE OBJECT');
      console.log('CONTENT:', content);
    }
  });
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