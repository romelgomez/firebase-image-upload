var Q = require('q');
var Firebase = require('firebase');
var _ = require('lodash');
var async = require('async');
var moment = require('moment');
var colors = require('colors');


module.exports = {
  reImport: reImport
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
 * To import data almost static Eje: (categories, locations), in case of loss or accidental deletion.
 * @param {String} taskTitle
 * @param {String} firePath
 * @param {Object} data
 * @return {Promise<Object>}
 * */
function reImport( taskTitle, firePath, data) {
  var deferred = Q.defer();
  console.log('['+moment().format('h:mm:ss').gray+'] Starting \''+ taskTitle.green +'\'...');
  var ref = new Firebase(firePath);

  function onComplete(error) {
    if (error) {
      elapsedTime('['+moment().format('h:mm:ss').gray+'] Error \''+ taskTitle.red +'\' after ');
      deferred.reject(error);
    } else {
      elapsedTime('['+moment().format('h:mm:ss').gray+'] Finished \''+ taskTitle.green +'\' after ');
      deferred.resolve();
    }
  }

  ref.set(data, onComplete);

  return deferred.promise;
}