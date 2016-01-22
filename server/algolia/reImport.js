var Q = require('q');
var utilities = require('./../utilities');
var algoliaSettings = require('./algoliaSettings');
var Firebase = require('firebase');
var _ = require('lodash');
var async = require('async');

var indexesSettings = require('./indexesSettings');

/**
 * Set a temp index in Algolia with the new data in fireBase, then remplace the index in production
 * @param {String} taskTitle
 * @param {String} firePath
 * @param {String} indexName
 * @return {Promise<Object>}
 * */
function reImport( taskTitle, firePath, indexName) {
  var deferred = Q.defer();
  utilities.startProcess(taskTitle);
  var tempIndex = algoliaSettings.client.initIndex(indexName+'Temp');
  var ref = new Firebase(firePath);
  ref.once('value', function(dataSnapshot){
    tempIndex.clearIndex()
      .then(function(){
        return addObjectIDs(dataSnapshot)
      })
      .then(function(the){
        var _deferred = Q.defer();

        // algolia recommend sending your records by batches of 1,000 or 10,000 records (depending on their size):
        // it will reduce the number of network calls and increase the overall indexing performance.
        var chunkedResults = _.chunk(the.objectsToIndex, 5000);
        async.each(chunkedResults, tempIndex.saveObjects.bind(tempIndex),
          function end(err) {
            if (err) {
              _deferred.reject(err);
            }else{
              _deferred.resolve();
            }
          });

        return _deferred.promise;
      })
      .then(function(){
        return algoliaSettings.client.moveIndex(indexName+'Temp', indexName)
      })
      .then(function(){
        return indexesSettings.updateIndexSettings();
      })
      .then(function(content){
        utilities.endProcess(taskTitle);
        deferred.resolve(content);
      },function(error){
        utilities.endProcess(taskTitle,error);
        deferred.reject(error);
      });
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


function main(){

  reImport('reImport publications data', 'berlin.firebaseio.com/publications', 'publications')
    .then(function(){
      console.log('······· The reImport was satisfactory ·······');
      process.exit();
    },function(error){
       console.error(error);
       process.exit();
    });

}

main();