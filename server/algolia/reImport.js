var algolia = require('./algolia');
var Firebase = require('firebase');

function main(){

  algolia.reImport('reImport publications data', 'berlin.firebaseio.com/publications', 'publications')
    .then(function(){
      process.exit();
    },function(error){
       console.error(error);
       process.exit();
    });

}

main();