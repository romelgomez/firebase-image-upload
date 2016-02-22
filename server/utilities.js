var moment = require('moment');
var colors = require('colors');

module.exports = {
  startProcess: startProcess,
  endProcess: endProcess
};

function startProcess(taskTitle){
  console.log('['+moment().format('h:mm:ss').gray+'] Starting \''+ taskTitle.yellow +'\'...');
}

function endProcess(taskTitle, error){
  if(error){
    elapsedTime('['+moment().format('h:mm:ss').gray+'] Error \''+ taskTitle.red +'\' after ');
  }else{
    elapsedTime('['+moment().format('h:mm:ss').gray+'] Finished \''+ taskTitle.green +'\' after ');
  }
}

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