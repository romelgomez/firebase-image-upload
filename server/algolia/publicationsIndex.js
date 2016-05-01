var updateIndex = require('./updateIndex');
var Firebase = require('firebase');
var colors = require('colors');

/*
  The reason why is two references to publications is for to avoid trigger child_added event over all the fetch data when the server is restarted
  https://gist.github.com/katowulf/6383103
  http://stackoverflow.com/questions/11788902/firebase-child-added-only-get-child-added
*/

var addPublicationsRef            = new Firebase('berlin.firebaseio.com/publications').orderByChild("releaseDate").startAt(Date.now()).limitToLast(1);
var changeRemovedPublicationsRef  = new Firebase('berlin.firebaseio.com/publications');

// Listen for changes to Firebase data
addPublicationsRef.on('child_added', function(dataSnapshot){
  // Get FireBase object
  var fireBaseObject = dataSnapshot.val();

  console.log('*** FIREBASE EVENT: Child ADDED ***'.red, ' title: '.black.bgWhite + fireBaseObject.title.black.bgWhite + '; releaseDate: '.black.bgWhite + fireBaseObject.releaseDate.toString().black.bgWhite);

  // Specify Algolia's objectID using the FireBase object key
  fireBaseObject.objectID = dataSnapshot.key();

  updateIndex.addUpdateIndex('ADD OBJECT', 'publications',fireBaseObject);

});

changeRemovedPublicationsRef.on('child_changed', function(dataSnapshot){

  // Get FireBase object
  var fireBaseObject = dataSnapshot.val();

  console.log('*** FIREBASE EVENT: Child CHANGED ***'.red, ' title: '.black.bgWhite + fireBaseObject.title.black.bgWhite + '; releaseDate: '.black.bgWhite + fireBaseObject.releaseDate.toString().black.bgWhite);

  // Specify Algolia's objectID using the FireBase object key
  fireBaseObject.objectID = dataSnapshot.key();

  updateIndex.addUpdateIndex('CHANGE OBJECT', 'publications', fireBaseObject);

});

changeRemovedPublicationsRef.on('child_removed', function(dataSnapshot){
  // Specify Algolia's objectID using the Firebase object key
  var objectID = dataSnapshot.key();

  // Get FireBase object
  var fireBaseObject = dataSnapshot.val();

  console.log('*** FIREBASE EVENT: Child REMOVED ***'.red, ' title: '.black.bgWhite + fireBaseObject.title.black.bgWhite + '; releaseDate: '.black.bgWhite + fireBaseObject.releaseDate.toString().black.bgWhite);

  updateIndex.deleteIndexObject('REMOVE OBJECT', 'publications',objectID);

});