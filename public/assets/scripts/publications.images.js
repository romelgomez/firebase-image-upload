publicationsModule
  .factory('imagesService', ['$q', function($q) {

    //function uploadFile(file, fileId, publicationId){
    //  var deferred = $q.defer();
    //
    //  file.upload = $upload.upload({
    //    url: 'https://api.cloudinary.com/v1_1/berlin/upload',
    //    fields: {
    //      public_id: fileId,
    //      upload_preset: 'ebdyaimw',
    //      context: 'alt=' + file.name + '|caption=' + file.name +  '|photo=' + file.name + '|$id=' + fileId,
    //      tags: [publicationId]
    //    },
    //    file: file
    //  }).progress(function (e) {
    //    file.progress = Math.round((e.loaded * 100.0) / e.total);
    //  }).success(function (data) {
    //    file.inServer = true;
    //    file.$id  = data.context.custom.$id;
    //
    //    deferred.resolve({
    //      '$id':data.context.custom.$id
    //    });
    //  }).error(function (data) {
    //    file.details  = data;
    //    deferred.reject();
    //  });
    //
    //  return deferred.promise;
    //}


    return {
      /** Delete all files of the publication, And you can selective delete files if their Ids are provider as array
       * @param {String} publicationId
       * @param {Array} imagesIds
       * @return {Promise<Object>}
       * */
      deleteImages : function(publicationId,imagesIds) {
        var deferred = $q.defer();
        var params = {
          publicationId: publicationId
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
      //saveFiles: function(publicationsRef, publicationId, files){
      //  var publicationImagesRef = publicationsRef.child(publicationId).child('images');
      //  var filesPromises = {};
      //  var filesReferences = {};
      //  angular.forEach(files,function(file){
      //    if(!angular.isDefined(file.inServer)){
      //      var imageRef = publicationImagesRef.push();
      //      filesReferences[imageRef.key()] = imageRef;
      //      filesPromises[imageRef.key()]   =  uploadFile(file,imageRef.key(),publicationId)
      //        .then(function(the){
      //          return filesReferences[the.$id].set({
      //            name:file.name,
      //            size:file.size,
      //            type:file.type,
      //            width:file.width,
      //            height:file.height,
      //            inServer:true,
      //            addedDate: $window.Firebase.ServerValue.TIMESTAMP
      //          })
      //        });
      //    }
      //  });
      //  return $q.all(filesPromises);
      //},
      featuredImage: function(publicationRef,imageId){
        var deferred = $q.defer();

        function onComplete(error) {
          if (error) {
            deferred.reject(error);
          } else {
            deferred.resolve();
          }
        }

        var record = {};
        if(angular.isDefined(imageId) && imageId!==''){
          record.featuredImageId = imageId;
        }else{
          record.featuredImageId = '';
        }

        publicationRef.update(record, onComplete);

        return deferred.promise;
      }
    };

  }])
  .directive('publicationImages',['$q', 'FireRef','notificationService', 'imagesService',function( $q, FireRef, notificationService , imagesService){

    return {
      scope:{
        formName:'=',
        images:'=',
        publicationId:'@',
        model:'=',
        httpRequestPromise:'='
      },
      templateUrl: 'discardPublication.html',
      link: function (scope) {

        var publicationsRef = FireRef.child('publications');
        var publicationRef = publicationsRef.child(scope.publicationId);

        scope.imagesInfo = function(){
          var info = {
            'inQueue':0,
            'inServer':0,
            'invalid':0
          };
          angular.forEach(scope.images,function(value){
            if(!angular.isDefined(value.inServer) && !angular.isDefined(value.$error)){
              info.inQueue += 1;
            }else{
              if(angular.isDefined(value.inServer)){
                info.inServer += 1;
              }else{
                info.invalid += 1;
              }
            }
          });
          return info;
        };

        scope.deleteAllPublicationImages = function () {
          // deleting in cloudinary
          imagesService.deleteImages(scope.publicationId,null)
            .then(function(){
              // deleting in firebase
              var imagesRef = publicationRef.child('images');
              return imagesRef.set({});
            })
            .then(function () {
              angular.copy([],scope.images);
              notificationService.success('The images has been deleted');
            },function(){
              notificationService.error('The images cannot be deleted');
            });
        };

        scope.setAsPrimaryImage = function(imageId){
          scope.httpRequestPromise = imagesService.featuredImage(publicationRef, imageId)
            .then(function(){
              scope.model.featuredImageId = imageId;
              notificationService.success('The file as been selected as featured image.');
            });
        };

        scope.removeFile = function(fileIndex,file){
          function removeFile(fileIndex){
            scope.images = $filter('filter')(scope.images, function(value, index) { return index !== fileIndex;});
            notificationService.success('The file as been delete.');
          }

          if(angular.isDefined(file.inServer)){
            var tasksToDo = {};
            if(file.$id === scope.model.featuredImageId){
              tasksToDo.blankFeaturedImage = imagesService.featuredImage(publicationRef).
              then(function(){
                scope.model.featuredImageId = '';
              });
            }
            tasksToDo.deleteImage = deleteImages(scope.publicationId,[file.$id])
              .then(function(){
                var imageRef = publicationsRef.child(scope.publicationId).child('images').child(file.$id);
                return imageRef.set({});
              })
              .then(function(){
                removeFile(fileIndex);
              },function(error){
                notificationService.error(error);
              });

            scope.httpRequestPromise = $q.all(tasksToDo);
          }else{
            removeFile(fileIndex);
          }
        };

        scope.removeInvalidFiles = function(){
          scope.images = $filter('filter')(scope.images, function(value) { return !angular.isDefined(value.$error);});
        };

        scope.removeAllQueueFiles = function () {
          scope.images = $filter('filter')(scope.images, function(value) {
            return !(!angular.isDefined(value.inServer) && !angular.isDefined(value.$error));
          });
        };

      }
    };

  }]);