angular.module('images', [])
  .factory('imagesService', [
    '$q',
    '$http',
    '$window',
    'rfc4122',
    'Upload',
    'CLOUDINARY_URL',
    'CLOUDINARY_UPLOAD_PRESET',
    function($q , $http, $window, rfc4122, Upload, CLOUDINARY_URL, CLOUDINARY_UPLOAD_PRESET) {

    function uploadFile(file, fileId, imagesTags){
      var deferred = $q.defer();

      file.upload = Upload.upload({
        url: CLOUDINARY_URL,
        fields: {
          public_id: fileId,
          upload_preset: CLOUDINARY_UPLOAD_PRESET,
          context: 'alt=' + file.name + '|caption=' + file.name +  '|photo=' + file.name,
          tags: imagesTags
        },
        file: file
      }).progress(function (e) {
        file.progress = Math.round((e.loaded * 100.0) / e.total);
      }).success(function (data) {
        file.isUploaded = true;
        file.$id        = data.public_id;
        deferred.resolve(data);
      }).error(function (data) {
        file.details  = data;
        deferred.reject();
      });

      return deferred.promise;
    }


    return {
      /** Delete all files of the publication, And you can selective delete files if their Ids are provider as array
       * @param {String} imagesTag
       * @param {Array} imagesIds
       * @return {Promise<Object>}
       * */
      deleteImages : function( imagesTag, imagesIds) {
        var deferred = $q.defer();
        var params = {
          tag: imagesTag
        };

        if (typeof imagesIds !== 'undefined' && Array.isArray(imagesIds)){
          params.public_ids = imagesIds;
        }

        $http({
          method: 'DELETE',
          url: '/files',
          params: params
        }).then(function(res){
          deferred.resolve(res);
        },function(error){
          deferred.reject(error);
        });

        return deferred.promise;
      },
      uploadFiles: function( files, imagesTags){
        var filesPromises = {};
        angular.forEach(files,function(file){
          if(!angular.isDefined(file.isUploaded)){
            var imageUUID = rfc4122.v4();
            filesPromises[imageUUID]   =  uploadFile(file, imageUUID, imagesTags)
          }
        });
        return $q.all(filesPromises);
      },
      featuredImage: function( ref, featuredImageName, imageId){
        var deferred = $q.defer();

        var record = {};
        if(angular.isDefined(imageId) && imageId!==''){
          record[featuredImageName] = imageId;
        }else{
          record[featuredImageName] = '';
        }

        ref.update(record)
          .then(function(){
            deferred.resolve();
          });

        return deferred.promise;
      },
      imagesInfo: function(images){
        var info = {
          'inQueue':0,
          'isUploaded':0,
          'invalid':0
        };
        angular.forEach(images,function(value){
          if(!angular.isDefined(value.isUploaded) && !angular.isDefined(value.$error)){
            info.inQueue += 1;
          }else{
            if(angular.isDefined(value.isUploaded)){
              info.isUploaded += 1;
            }else{
              info.invalid += 1;
            }
          }
        });
        return info;
      }
    };

  }])
  .directive('uploadImages',['$q', '$filter', 'FireRef','notificationService', 'imagesService',function( $q, $filter, FireRef, notificationService , imagesService){

    return {
      scope:{
        formName:'=',
        httpRequestPromise:'=',
        images:'=',
        imagesTag:'=',
        imagesPath:'=',
        featuredImageId:'=',
        featuredImageName:'=',
        featuredImagePath:'='
      },
      templateUrl: 'static/assets/views/directives/uploadImages.html',
      link: function (scope) {

        scope.imagesInfo = function(){
          return imagesService.imagesInfo(scope.images);
        };

        // Example: publicationId, publications/publicationId/images
        scope.deleteAllImages = function (imagesTag, imagesPath) {
          // deleting in cloudinary
          scope.httpRequestPromise = imagesService.deleteImages(imagesTag, null)
            .then(function(){
              console.log('never past for here');
              // deleting in firebase
              var ref = FireRef.child(imagesPath);
              return ref.set({});
            })
            .then(function () {
              angular.copy([],scope.images);
              notificationService.success('The images has been deleted');
            },function(){
              notificationService.error('The images cannot be deleted');
            });
        };

        // Example publications/publicationId, ...
        scope.setAsPrimaryImage = function(featuredImagePath, imageId){
          scope.httpRequestPromise = imagesService.featuredImage( FireRef.child(featuredImagePath), scope.featuredImageName, imageId)
            .then(function(){
              scope.featuredImageId = imageId;
              notificationService.success('The file as been selected as featured image.');
            });
        };

        // Example  publications/publicationId/images, publications/publicationId, publicationId, ..., ...
        scope.removeFile = function(imagesPath, featuredImagePath, imagesTag, fileIndex, file){
          function removeFile(fileIndex){
            scope.images = $filter('filter')(scope.images, function(value, index) { return index !== fileIndex;});
          }

          if(angular.isDefined(file.isUploaded)){
            var tasksToDo = [];

            // blankFeaturedImage
            if(file.$id === scope.featuredImageId){
              var blankFeaturedImage = imagesService.featuredImage(FireRef.child(featuredImagePath)).
              then(function(){
                scope.featuredImageId = '';
              });
              tasksToDo.push(blankFeaturedImage);
            }

            // deleteImage
            var deleteImage = imagesService.deleteImages(imagesTag,[file.$id])
              .then(function(){
                var imageRef = FireRef.child(imagesPath).child(file.$id);
                return imageRef.set({});
              })
              .then(function(){
                removeFile(fileIndex);
              });

            tasksToDo.push(deleteImage);

            scope.httpRequestPromise = $q.all(tasksToDo)
              .then(function(){
                notificationService.success('The file as been delete.');
              },function(error){
                notificationService.error(error);
              });

          }else{
            removeFile(fileIndex);
            notificationService.success('The file as been delete.');
          }
        };

        scope.removeInvalidFiles = function(){
          scope.images = $filter('filter')(scope.images, function(value) { return !angular.isDefined(value.$error);});
        };

        scope.removeAllQueueFiles = function () {
          scope.images = $filter('filter')(scope.images, function(value) {
            return !(!angular.isDefined(value.isUploaded) && !angular.isDefined(value.$error));
          });
          notificationService.success('All queue files have been removed.');
        };

      }
    };

  }]);