var Q = require('q');
var cloudinary = require('cloudinary');
var formidable = require('formidable');

cloudinary.config({
  cloud_name: 'berlin',
  api_key: '987626748619663',
  api_secret: 'ZtQveh15sfuAmOjFkRyuUgMpGuA'
});

// http://cloudinary.com/documentation/admin_api#delete_all_facebook_pictures

cloudinary.api.delete_all_resources(function(result){

  console.log('result: ',result);

});
