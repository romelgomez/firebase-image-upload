var algolia = require('./algolia');
var Firebase = require('firebase');
var publicationsRef = new Firebase('berlin.firebaseio.com/publications');

// Listen for changes to Firebase data
publicationsRef.on('child_added', function(dataSnapshot){
  // Get FireBase object
  var fireBaseObject = dataSnapshot.val();

  // Specify Algolia's objectID using the FireBase object key
  fireBaseObject.objectID = dataSnapshot.key();

  algolia.index('add object', 'publications',fireBaseObject);

});

publicationsRef.on('child_changed', function(dataSnapshot){

  // Get FireBase object
  var fireBaseObject = dataSnapshot.val();

  // Specify Algolia's objectID using the FireBase object key
  fireBaseObject.objectID = dataSnapshot.key();

  algolia.index('change object', 'publications', fireBaseObject);

});

publicationsRef.on('child_removed', function(dataSnapshot){
  // Specify Algolia's objectID using the Firebase object key
  var objectID = dataSnapshot.key();

  algolia.deleteIndexObject('remove object', 'publications',objectID);

});