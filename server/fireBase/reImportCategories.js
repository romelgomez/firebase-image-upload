var fireBaseUtilities = require('./fireBaseUtilities');
var categoriesData = require('./categoriesData.js');

function main (){
  fireBaseUtilities.reImport('reImport categories','categories', categoriesData.data)
    .then(function(){
      process.exit();
    },function(error){
      console.error(error);
      process.exit();
    });
}

main();