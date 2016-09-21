/**
 * Run? 'node deleteAllResourceCloudinary.js'
 * Will delete all images for the current config
 */

var cloudinary = require('cloudinary');
var cloudinaryConfig = require('./cloudinaryConfig');

cloudinary.config(cloudinaryConfig.config);

/**
 * More Info of delete_all_resources method:
 * http://cloudinary.com/documentation/admin_api#delete_all_facebook_pictures
 */
cloudinary.api.delete_all_resources(function(result){
  console.log('Result: ',result);
});
