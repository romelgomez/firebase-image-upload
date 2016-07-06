var fireBaseUtilities = require('./fireBaseUtilities');
var locationsData = require('./locationsData.js');

function main (){
  fireBaseUtilities.reImport('reImport locations', 'locations', locationsData.data)
    .then(function(){
      process.exit();
    },function(error){
      console.error(error);
      process.exit();
    });
}

main();