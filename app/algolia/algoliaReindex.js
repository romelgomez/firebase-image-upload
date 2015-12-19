var algolia = require('./algolia');
var Firebase = require('firebase');

function main(){
  console.log('-------------------------------------------');
  console.log('START REINDEX PUBLICATIONS');

  var publicationsRef = new Firebase('berlin.firebaseio.com/publications');
  publicationsRef.on('value', function(dataSnapshot){

    algolia.reIndex('publications',dataSnapshot,{
      attributesToIndex: ['barcode','title','path','unordered(description)'],
      attributesForFaceting: ['path','price']
    })
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