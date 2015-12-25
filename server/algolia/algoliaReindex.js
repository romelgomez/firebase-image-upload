var algolia = require('./algolia');
var Firebase = require('firebase');

var settings = {
  attributesToIndex: ['barcode','title','unordered(description)'],
  attributesForFaceting: ['categories','userID']
};

function main(){
  console.log('-------------------------------------------');
  console.log('START REINDEX PUBLICATIONS');

  var publicationsRef = new Firebase('berlin.firebaseio.com/publications');
  publicationsRef.on('value', function(dataSnapshot){

    algolia.reIndex('publications',dataSnapshot,settings)
      .then(function(content){
        console.log('PUBLICATIONS REINDEX IS DONE');
        console.log('CONTENT: ', content);
        process.exit();
      },function(error){
        throw error;
      })

  });

}

main();