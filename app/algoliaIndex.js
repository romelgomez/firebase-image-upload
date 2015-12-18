var algolia = require('./algolia');
var Firebase = require('firebase');
var publicationsRef = new Firebase('berlin.firebaseio.com/publications');

// Listen for changes to Firebase data
publicationsRef.on('child_added', function(dataSnapshot){
  console.log('-------------------------------------------');
  console.log('START ADD OBJECT');

  algolia.index('publications',dataSnapshot,{
    attributesToIndex: ['title','description','price','quantity','barcode','warranty'],
    customRanking: ['asc(title)']
  })
    .then(function(content){
      console.log('-------------------------------------------');
      console.log('CONTENT ADDED');
      console.log(content);
    },function(error){
      throw error;
    });

});

publicationsRef.on('child_changed', function(dataSnapshot){
  console.log('-------------------------------------------');
  console.log('START UPDATE OBJECT');

  algolia.index('publications',dataSnapshot,{
    attributesToIndex: ['title','description','price','quantity','barcode','warranty'],
    customRanking: ['asc(title)']
  })
    .then(function(content){
      console.log('-------------------------------------------');
      console.log('CONTENT ADDED OR UPDATED:');
      console.log(content);
    },function(error){
      throw error;
    });

});

publicationsRef.on('child_removed', function(dataSnapshot){
  console.log('-------------------------------------------');
  console.log('START REMOVE OBJECT');

  algolia.deleteIndexObject('publications',dataSnapshot)
    .then(function(content){
      console.log('-------------------------------------------');
      console.log('CONTENT REMOVED:');
      console.log(content);
    },function(error){
      throw error;
    });

});