var indexesSettings = require('./indexesSettings');

function main (){
  indexesSettings.updateIndexSettings()
    .then(function(){
      console.log('······· All Settings have been successfully established ·······')
    },function(error){
      console.error(error);
    });
}

main();