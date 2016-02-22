var Q = require('q');
var utilities = require('./../utilities');
var algoliaSettings = require('./algoliaSettings');


module.exports = {
  addUpdateIndex: addUpdateIndex,
  deleteIndexObject: deleteIndexObject
};

/**
 * add Or Update Object to index
 * @param {String} taskTitle
 * @param {String} indexName
 * @param {Object} data
 * @return {Promise<Object>}
 * */
function addUpdateIndex( taskTitle, indexName, data){
  var deferred = Q.defer();
  utilities.startProcess(taskTitle);
  var index = algoliaSettings.client.initIndex(indexName);

  index.saveObject(data)
    .then(function(content){
      utilities.endProcess(taskTitle);
      deferred.resolve(content);
    },function(error){
      utilities.endProcess(taskTitle, error);
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
  utilities.startProcess(taskTitle);
  var index = algoliaSettings.client.initIndex(indexName);

  index.deleteObject(objectID)
    .then(function(content){
      utilities.endProcess(taskTitle);
      deferred.resolve(content);
    },function(error){
      utilities.endProcess(taskTitle,error);
      deferred.reject(error);
    });

  return deferred.promise;
}