var algolia = require('./algolia');
var Firebase = require('firebase');
var publicationsRef = new Firebase('berlin.firebaseio.com/publications');

var settings = {
  attributesToIndex: ['barcode','title','unordered(description)'],
  attributesForFaceting: ['path','price','userUid']
};

// Listen for changes to Firebase data
publicationsRef.on('child_added', function(dataSnapshot){
  console.log('-------------------------------------------');
  console.log('START ADD OBJECT');

  // Get FireBase object
  var fireBaseObject = dataSnapshot.val();

  // Specify Algolia's objectID using the FireBase object key
  fireBaseObject.objectID = dataSnapshot.key();

  algolia.index('publications',fireBaseObject, settings)
    .then(function(content){
      console.log('-------------------------------------------');
      console.log('CONTENT ADDED');
      console.log(content);
    },function(error){
      throw error;
    });

});

publicationsRef.on('child_changed', function(dataSnapshot){
  console.log('-------------------------------------------');
  console.log('START UPDATE OBJECT');

  // Get FireBase object
  var fireBaseObject = dataSnapshot.val();

  // Specify Algolia's objectID using the FireBase object key
  fireBaseObject.objectID = dataSnapshot.key();

  algolia.index('publications', fireBaseObject, settings)
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

  // Specify Algolia's objectID using the Firebase object key
  var objectID = dataSnapshot.key();

  algolia.deleteIndexObject('publications',objectID)
    .then(function(content){
      console.log('-------------------------------------------');
      console.log('CONTENT REMOVED:');
      console.log(content);
    },function(error){
      throw error;
    });

});