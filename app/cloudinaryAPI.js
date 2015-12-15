var Q = require('q');
var cloudinary = require('cloudinary');
var formidable = require('formidable');

cloudinary.config({
  cloud_name: 'berlin',
  api_key: '987626748619663',
  api_secret: 'ZtQveh15sfuAmOjFkRyuUgMpGuA'
});

/**
 * Upload file
 * @param {File} file
 * @param {Object} fields
 * @return {Promise<Object>}
 * */
function $upload(file,fields){
 var deferred = Q.defer();

  cloudinary.uploader.upload(
    file.path,
    function(result) {
      deferred.resolve({result: result});
    },
    {
      public_id: 'publications/' + fields.fileId,
      upload_preset: 'pmceswio',
      context: 'alt=' + file.name + '|caption=' + file.name +  '|photo=' + file.name + '|$id=' + fields.fileId
    }
  );

  return deferred.promise;
}

/**
 * Delete file
 *
 *  Doc: http://cloudinary.com/documentation/admin_api#delete_uploaded_images_by_public_ids
 *
 * @param {Array} idList
 * @return {Promise<Object>}
 * */
function $delete(idList){
  var deferred = Q.defer();

  cloudinary.api.delete_resources(idList,
    function(result){
      deferred.resolve({result: result});
    });

  return deferred.promise;
}

module.exports = function(app){

  app.post('/files', function(req, res){
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
      $upload(files.file,fields)
        .then(function(the){
          res.json(the.result);
        });
    });
  });

  app.delete('/files',function(req, res){

    $delete(JSON.parse(req.query.public_ids))
      .then(function(the){
        res.json(the.result);
      });

  });

};

// var deferred = Q.defer();
// deferred.reject();
// deferred.resolve();
// return deferred.promise;

// file.name
//fields: {
//  public_id: 'publications/'+fileId,
//  upload_preset: 'ebdyaimw',
//  context: 'alt=' + file.name + '|caption=' + file.name +  '|photo=' + file.name + '|$id=' + fileId
//}
// pmceswio
