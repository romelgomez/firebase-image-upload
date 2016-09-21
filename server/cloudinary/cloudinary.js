var Q = require('q');
var cloudinary = require('cloudinary');
var cloudinaryConfig = require('./cloudinaryConfig');

cloudinary.config(cloudinaryConfig.config);

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

/**
 * API
 */
module.exports = function(app){

  /**
   * DELETE
   */
  app.delete('/files',function(req, res){

    if (typeof req.query.public_ids !== "undefined"){
      var ids = [];

      if(Array.isArray(req.query.public_ids)){
        ids = req.query.public_ids;
      }else{
        ids = [req.query.public_ids]
      }

      $deleteByIDs(ids)
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