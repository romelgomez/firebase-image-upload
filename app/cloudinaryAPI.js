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
      public_id: fields.fileId,
      upload_preset: 'pmceswio',
      context: 'alt=' + file.name + '|caption=' + file.name +  '|photo=' + file.name + '|$id=' + fields.fileId,
      tags: [fields.publicationId]
    }
  );

  return deferred.promise;
}

/**
 * Delete uploaded resource by public IDs
 *
 *  Doc: http://cloudinary.com/documentation/admin_api#delete_uploaded_images_by_public_ids
 *
 * @param {Array} IDs
 * @return {Promise<Object>}
 * */
function $deleteByIDs(IDs){
  var deferred = Q.defer();

  cloudinary.api.delete_resources(IDs,
    function(result){
      deferred.resolve({result: result});
    });

  return deferred.promise;
}

/**
 * Delete all resources with the given tag name.
 *
 * Doc: http://cloudinary.com/documentation/admin_api#delete_resources_by_tags
 *
 * @param {String} tag
 * @return {Promise<Object>}
 * */
function $deleteByTag(tag){
  var deferred = Q.defer();

  cloudinary.api.delete_resources_by_tag(tag,
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

    if (typeof req.query.public_ids !== "undefined"){
      $deleteByIDs(JSON.parse(req.query.public_ids))
        .then(function(the){
          res.json(the.result);
        });
    } else if ( typeof req.query.tag !== "undefined") {
      $deleteByTag(req.query.tag)
        .then(function(the){
          res.json(the.result);
        });
    } else {
      res.status(400).send({ error: 'Bad Request!' });
    }

  });

};