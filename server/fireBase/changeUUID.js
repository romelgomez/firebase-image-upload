var Q = require('q');
var firebase = require('./../fire');

var _ = require('lodash');
var async = require('async');
var moment = require('moment');
var colors = require('colors');


function changeUUID( targetUUID, newUUID) {
  var deferred = Q.defer();
  console.log('The process start.');

  var promises = [];

  var ref = firebase.FireRef.child('publications');

  ref.orderByChild('userID').equalTo(targetUUID).once('value')
    .then(function(snapshot){

      var publications = snapshot.val();

      for (var publicationKey in publications) {
        if( publications.hasOwnProperty( publicationKey ) ) {

          console.log('publicationKey', publicationKey);
          promises.push(ref.child(publicationKey).update({userID: newUUID}))

        }
      }

      return Q.all(promises);
      //return Q.when(true);
    })
    .then(function(){
      console.log('The process is complete.');
      process.exit();
    },function(error){
      console.log('Error', error);
      process.exit();
    });

  return deferred.promise;
}

 //changeUUID('', '');