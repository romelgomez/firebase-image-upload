var Firebase = require('firebase');
var algoliasearch = require('algoliasearch');
var Q = require('q');
var client = algoliasearch('FU6V8V2Y6Q', '1d84a9feb84aaff718e378e7dc66efef');
var index = client.initIndex('publications');

var publicationsRef = new Firebase('berlin.firebaseio.com/publications');

// Listen for changes to Firebase data
publicationsRef.on('child_added',   function(dataSnapshot){
  console.log('-------------------------------------------');
  console.log('ADD INDEX', dataSnapshot.key());
});

publicationsRef.on('child_changed', function(dataSnapshot){
  console.log('------------------------------------------');
  console.log('UPDATE INDEX', dataSnapshot.key());
});

publicationsRef.on('child_removed', function(dataSnapshot){
  console.log('-------------------------------------------');
  console.log('DELETE INDEX', dataSnapshot.key());
});

// endAt().limitToLast(1)

//var deferred = $q.defer();

//function addObject(dataSnapshot) {
//  // Get FireBase object
//  var fireBaseObject = dataSnapshot.val();
//  var algoliaObject = {};
//
//  console.log('·············································');
//  console.log('ADD INDEX');
//  console.log('');
//  console.log('firebaseObject: ',fireBaseObject);
//  console.log('');
//  console.log('dataSnapshot.key: ',dataSnapshot.key());
//  console.log('');
//  console.log('·············································');
//
//  //// Specify Algolia's objectID using the Firebase object key
//  fireBaseObject.objectID = dataSnapshot.key();
//
//  //// Add or update object
//  index.addObject(fireBaseObject, function(err, content) {
//    if (err) {
//      throw err;
//    }
//    console.log('Firebase<>Algolia object saved');
//  });
//
//}
//
//function updateObject(dataSnapshot) {
//  // Get Firebase object
//  var fireBaseObject = dataSnapshot.val();
//
//  console.log('-------------------------------------------');
//  console.log('UPDATE INDEX');
//  console.log('');
//  console.log('firebaseObject: ',fireBaseObject);
//  console.log('');
//  console.log('dataSnapshot.key: ',dataSnapshot.key());
//  console.log('-------------------------------------------');
//
//  //// Specify Algolia's objectID using the Firebase object key
//  fireBaseObject.objectID = dataSnapshot.key();
//
//  //// Add or update object
//  index.saveObject(fireBaseObject, function(err, content) {
//    if (err) {
//      throw err;
//    }
//    console.log('Firebase<>Algolia object saved');
//  });
//
//}
//
//function removeIndex(dataSnapshot) {
//
//  console.log('-------------------------------------------');
//  console.log('REMOVE INDEX');
//  console.log('dataSnapshot.key: ',dataSnapshot.key());
//  console.log('-------------------------------------------');
//
//  //// Get Algolia's objectID from the Firebase object key
//  var objectID = dataSnapshot.key();
//
//  //// Remove the object from Algolia
//  index.deleteObject(objectID, function(err, content) {
//    if (err) {
//      throw err;
//    }
//
//    console.log('Firebase<>Algolia object deleted', content);
//  });
//}

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