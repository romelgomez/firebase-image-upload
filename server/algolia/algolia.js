var Q = require('q');
var algoliasearch = require('algoliasearch');
var Firebase = require('firebase');
var _ = require('lodash');
var async = require('async');
var moment = require('moment');
var colors = require('colors');

var client = algoliasearch('FU6V8V2Y6Q', '1d84a9feb84aaff718e378e7dc66efef');

module.exports = {
  index: index,
  reImport: reImport,
  setSettings: setSettings,
  deleteIndexObject: deleteIndexObject
};

/**
 * required by elapsedTime function, to set a timer
 * */
var start = process.hrtime();

/**
 * Log the elapsed time of the process
 * @param {String} note
 * @source http://stackoverflow.com/questions/10617070/how-to-measure-execution-time-of-javascript-code-with-callbacks
 * */
function elapsedTime(note){
  var precision = 3; // 3 decimal places
  var elapsed = process.hrtime()[1] / 1000000; // divide by a million to get nano to milli
  console.log(note + process.hrtime()[0] + " s, " + elapsed.toFixed(precision) + " ms"); // print message + time
  start = process.hrtime(); // reset the timer
}

/**
 * add Or Update Object to index
 * @param {String} taskTitle
 * @param {String} indexName
 * @param {Object} data
 * @return {Promise<Object>}
 * */
function index( taskTitle, indexName, data){
  var deferred = Q.defer();
  console.log('['+moment().format('h:mm:ss').gray+'] Starting \''+ taskTitle.yellow +'\'...');
  var index = client.initIndex(indexName);

  index.saveObject(data)
    .then(function(content){
      elapsedTime('['+moment().format('h:mm:ss').gray+'] Finished \''+ taskTitle.green +'\' after ');
      deferred.resolve(content);
    },function(error){
      elapsedTime('['+moment().format('h:mm:ss').gray+'] Error \''+ taskTitle.red +'\' after ');
      deferred.reject(error);
    });

  return deferred.promise;
}

/**
 * Delete index object
 * @param {String} taskTitle
 * @param {String} indexName
 * @param {String} objectID
 * @return {Promise<Object>}
 * */
function deleteIndexObject(taskTitle, indexName, objectID){
  var deferred = Q.defer();
  console.log('['+moment().format('h:mm:ss').gray+'] Starting \''+ taskTitle.green +'\'...');
  var index = client.initIndex(indexName);

  index.deleteObject(objectID)
    .then(function(content){
      elapsedTime('['+moment().format('h:mm:ss').gray+'] Finished \''+ taskTitle.green +'\' after ');
      deferred.resolve(content);
    },function(error){
      elapsedTime('['+moment().format('h:mm:ss').gray+'] Error \''+ taskTitle.red +'\' after ');
      deferred.reject(error);
    });

  return deferred.promise;
}

/**
 * Set settings for indexName index
 * @param {String} taskTitle
 * @param {String} indexName
 * @param {Object} settings
 * @return {Promise<Object>}
 * */
function setSettings( taskTitle, indexName, settings){
  var deferred = Q.defer();
  console.log('['+moment().format('h:mm:ss').gray+'] Starting \''+ taskTitle.yellow +'\'...');
  var index = client.initIndex(indexName);
  index.setSettings(settings)
    .then(function(content){
      elapsedTime('['+moment().format('h:mm:ss').gray+'] Finished \''+ taskTitle.green +'\' after ');
      deferred.resolve(content);
    }, function (error) {
      elapsedTime('['+moment().format('h:mm:ss').gray+'] Error \''+ taskTitle.red +'\' after ');
      deferred.reject(error);
    });
  return deferred.promise;
}

/**
 * Set a temp index in Algolia with the new data in fireBase, then remplace the index in production
 * @param {String} taskTitle
 * @param {String} firePath
 * @param {String} indexName
 * @return {Promise<Object>}
 * */
function reImport( taskTitle, firePath, indexName) {
  var deferred = Q.defer();
  console.log('['+moment().format('h:mm:ss').gray+'] Starting \''+ taskTitle.green +'\'...');
  var tempIndex = client.initIndex(indexName+'Temp');
  var ref = new Firebase(firePath);
  ref.once('value', function(dataSnapshot){
    tempIndex.clearIndex()
      .then(function(){
        return addObjectIDs(dataSnapshot)
      })
      .then(function(the){
        var _deferred = Q.defer();

        // algolia recommend sending your records by batches of 1,000 or 10,000 records (depending on their size): it will reduce the number of network calls and increase the overall indexing performance.
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
        return client.moveIndex(indexName+'Temp', indexName)
      })
      .then(function(content){
        elapsedTime('['+moment().format('h:mm:ss').gray+'] Finished \''+ taskTitle.green +'\' after ');
        deferred.resolve(content);
      },function(error){
        elapsedTime('['+moment().format('h:mm:ss').gray+'] Error \''+ taskTitle.red +'\' after ');
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