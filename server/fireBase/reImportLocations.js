var fireBaseUtilities = require('./fireBaseUtilities');

var data = {};

function main (){
  fireBaseUtilities.reImport('reImport locations','berlin.firebaseio.com/locations',data)
    .then(function(){
      process.exit();
    },function(error){
      console.error(error);
      process.exit();
    });
}

main();