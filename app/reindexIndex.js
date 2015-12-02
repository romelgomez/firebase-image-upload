var Firebase = require('firebase');
var algoliasearch = require('algoliasearch');
var Q = require('q');
var client = algoliasearch('FU6V8V2Y6Q', '1d84a9feb84aaff718e378e7dc66efef');
var index = client.initIndex('publications');

var publicationsRef = new Firebase('berlin.firebaseio.com/publications');

function reindexIndex(dataSnapshot) {
  var deferred = Q.defer();

  // Array of objects to index
  var objectsToIndex = [];

  // Create a temp index
  var tempIndexName = 'publications_temp';
  var tempIndex = client.initIndex(tempIndexName);

  // Get all objects
  var values = dataSnapshot.val();

  // Process each Firebase object
  for (var key in values) {
    if (values.hasOwnProperty(key)) {
      // Get current Firebase object
      var firebaseObject = values[key];

      // Specify Algolia's objectID using the Firebase object key
      firebaseObject.objectID = key;

      // Add object for indexing
      objectsToIndex.push(firebaseObject);
    }
  }

  // Add or update new objects
  index.saveObjects(objectsToIndex, function(error, content) {
    if (error) {
      deferred.reject(error);
    }

    // Overwrite main index with temp index
    client.moveIndex(tempIndexName, 'publications', function(error, content) {
      if (error) {
        deferred.reject(error);
      }else{
        deferred.resolve(content);
      }

    });
  });

  return deferred.promise;
}

function reindexData(){
  console.log('-------------------------------------------');
  console.log('START REINDEX DATA');

  publicationsRef.on('value', function(dataSnapshot){
    reindexIndex(dataSnapshot)
      .then(function(content){
        console.log('REINDEX IS DONE');
        console.log('CONTENT: ', content);
        process.exit();
      },function(error){
        throw error;
      })
  });
}

reindexData();