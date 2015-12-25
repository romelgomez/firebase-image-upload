var Q = require('q');
var algoliasearch = require('algoliasearch');
var client = algoliasearch('FU6V8V2Y6Q', '1d84a9feb84aaff718e378e7dc66efef');

module.exports = {
  index: index,
  reIndex: reIndex,
  deleteIndexObject: deleteIndexObject
};

/**
 * add Or Update Object to index
 * @param {String} indexName
 * @param {Object} data
 * @param {Object} settings
 * @return {Promise<Object>}
 * */
function index(indexName, data, settings){
  var deferred = Q.defer();
  var index = client.initIndex(indexName);

  index.setSettings(settings)
    .then(function(){
      return index.saveObject(data)
    })
    .then(function(content){
      deferred.resolve(content);
    },function(error){
      deferred.reject(error);
    });

  return deferred.promise;
}

/**
 * Delete index object
 * @param {String} indexName
 * @param {String} objectID
 * @return {Promise<Object>}
 * */
function deleteIndexObject(indexName, objectID){
  var deferred = Q.defer();
  var index = client.initIndex(indexName);

  index.deleteObject(objectID)
    .then(function(content){
      deferred.resolve(content);
    },function(error){
      deferred.reject(error);
    });

  return deferred.promise;
}


/**
 * Set for every object the objectID required for Algolia, and return all as array of objects.
 * @param {Object} dataSnapshot
 * @return {Promise<Array>}
 * */
function addObjectIDs(dataSnapshot){
  var deferred = Q.defer();

  // Array of objects to index
  var objectsToIndex = [];

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
    if(Object.keys(values).length === objectsToIndex.length){
      deferred.resolve({objectsToIndex: objectsToIndex});
    }
  }

  return deferred.promise;
}

/**
 * Set a temp index in Algolia with the new data in fireBase, then remplace the index in production
 * @param {String} indexName
 * @param {Object} dataSnapshot
 * @param {Object} settings
 * @return {Promise<Object>}
 * */
function reIndex( indexName, dataSnapshot, settings) {
  var deferred = Q.defer();
  var tempIndex = client.initIndex(indexName+'Temp');

  tempIndex.setSettings(settings)
    .then(function(){
      return tempIndex.clearIndex()
    })
    .then(function(){
      return addObjectIDs(dataSnapshot)
    })
    .then(function(the){
      return tempIndex.saveObjects(the.objectsToIndex);
    })
    .then(function(){
      return client.moveIndex(indexName+'Temp', indexName)
    })
    .then(function(content){
      deferred.resolve(content);
    },function(error){
      deferred.reject(error);
    });

  return deferred.promise;
}