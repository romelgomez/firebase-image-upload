var Firebase = require('firebase');
var algoliasearch = require('algoliasearch');
var Q = require('q');
var client = algoliasearch('FU6V8V2Y6Q', '1d84a9feb84aaff718e378e7dc66efef');
var index = client.initIndex('publications');

var publicationsRef = new Firebase('berlin.firebaseio.com/publications');

//var deferred = Q.defer();
//deferred.reject();
//deferred.resolve();
//return deferred.promise;

/**
 * Publication attributes to index
 * @param {Object} dataSnapshot
 * @param {Array} toExclude
 * @return {Promise<Array>}
 * */
function attributesToIndex(dataSnapshot,toExclude){
  var deferred = Q.defer();

  function toIndex (dataSnapshot){
    var deferred = Q.defer();
    var list = [];
    var dataSnapshotLength = Object.keys(dataSnapshot).length;
    for(var prop in dataSnapshot) {
      if (dataSnapshot.hasOwnProperty(prop)) {
        list.push(prop);
      }
      if(list.length === dataSnapshotLength){
        deferred.resolve(list);
      }
    }
    return deferred.promise;
  }

  function toDiscard (dataSnapshot,attributesToExclude){
    var deferred = Q.defer();
    if(attributesToExclude.length > 0){
      for (var i = 0; i < attributesToExclude.length; i++) {
        if (dataSnapshot.hasOwnProperty(attributesToExclude[i])) {
          delete dataSnapshot[attributesToExclude[i]];
        }
        if(i === (attributesToExclude.length-1)){
          deferred.resolve(dataSnapshot);
        }
      }
    }else{
      deferred.resolve(dataSnapshot);
    }
    return deferred.promise;
  }

  if(toExclude.length > 0){
    toDiscard(dataSnapshot,toExclude)
      .then(toIndex)
      .then(function(list){
        deferred.resolve(list);
      })
  }else{
    toIndex(dataSnapshot)
      .then(function(list){
        deferred.resolve(list);
      })
  }

  return deferred.promise;
}

function setSettings(dataSnapshot){
  var deferred = Q.defer();

  var toIndexList = attributesToIndex(dataSnapshot,[
    'htmlDescription',
    'images'
  ]);

  Q.all({attributesToIndex: toIndexList})
    .then(function(the){
      index.setSettings({
        attributesToIndex: the.attributesToIndex,
        customRanking: ['asc(title)']
      });
    })
    .then(function(){
      deferred.resolve();
    });

  return deferred.promise;
}

// Listen for changes to Firebase data
publicationsRef.on('child_added', function(dataSnapshot){

  console.log('-------------------------------------------');
  console.log('START ADD OR UPDATE OBJECT');

  setSettings(dataSnapshot)
    .then(function(){

      addOrUpdateObject(dataSnapshot)
        .then(function(content){
          console.log('-------------------------------------------');
          console.log('CONTENT ADDED OR UPDATED:');
          console.log(content);
        },function(error){
          throw error;
        });

    });

});

publicationsRef.on('child_changed', function(dataSnapshot){
  console.log('-------------------------------------------');
  console.log('START ADD OR UPDATE OBJECT');

  setSettings(dataSnapshot)
    .then(function(){

      addOrUpdateObject(dataSnapshot)
        .then(function(content){
          console.log('-------------------------------------------');
          console.log('CONTENT ADDED OR UPDATED:');
          console.log(content);
        },function(error){
          throw error;
        });

    });

});

publicationsRef.on('child_removed', function(dataSnapshot){
  console.log('-------------------------------------------');
  console.log('START REMOVE OBJECT');

  setSettings(dataSnapshot)
    .then(function(){

      removeIndex(dataSnapshot)
        .then(function(content){
          console.log('-------------------------------------------');
          console.log('CONTENT REMOVED:');
          console.log(content);
        },function(error){
          throw error;
        });

    });

});

function addOrUpdateObject(dataSnapshot){
  // Get FireBase object
  var fireBaseObject = dataSnapshot.val();

  // Specify Algolia's objectID using the FireBase object key
  fireBaseObject.objectID = dataSnapshot.key();

  // https://github.com/algolia/algoliasearch-client-js#promises
  return index.saveObject(fireBaseObject);
}

function removeIndex(dataSnapshot) {
  // Specify Algolia's objectID using the Firebase object key
  var objectID = dataSnapshot.key();

  // https://github.com/algolia/algoliasearch-client-js#promises
  return index.deleteObject(objectID);
}

/*

Working links:

 https://www.algolia.com/doc/tutorials/firebase-algolia#Introduction
 https://www.algolia.com/explorer#?index=publications
 https://www.algolia.com/doc/tutorials/getting-started-realtime-search
 https://www.algolia.com/doc/node#setup
 https://github.com/algolia/algoliasearch-client-js#table-of-contents
 https://github.com/algolia/instant-search-demo

 https://www.npmjs.com/package/uuid
 https://www.algolia.com/doc/node#indexing-parameters
 https://github.com/algolia/instantsearch.js
 https://community.algolia.com/instantsearch.js/examples/
 https://community.algolia.com/instantsearch.js/examples/e-commerce/
 https://www.algolia.com/doc/tutorials/auto-complete#introduction
 https://www.codementor.io/php/tutorial/how-to-build-a-search-engine-algolia
 http://www.ranks.nl/stopwords
 https://www.algolia.com/doc/tutorials/firebase-algolia#Introduction

FireBase example model data
 categoryId: "-K0mwcnvIP3bThk_-4RX"
 description: "dasdasdas"
 featuredImageId: ""
 htmlDescription: "<p>dasdasdas</p>"
 path
   0: "Real Estate"
 releaseDate: 1449022789816
 title: "Dasdasdasd 22211"
 type: "realEstate"
 userUid: "facebook:10204911533563856"


Example Model:

[
  {
    "name": "Monica Bellucci",
    "alternative_name": "Monica Anna Maria Bellucci",
    "rating": 3956,
    "image_path": "/z3sLuRKP7hQVr.jpg"
  },
  {
    "name": "Sean Connery",
    "alternative_name": "Sir Sean Connery",
    "rating": 746,
    "image_path": "/ce84udJZ9QRSR44jxwK2apM3DM8.jpg"
  },
  {
    "name": "Will Smith",
    "alternative_name": null,
    "rating": 492,
    "image_path": "/2iYXDlCvLyVO49louRyDDXagZ0G.jpg"
  },
  {...}
]
*/