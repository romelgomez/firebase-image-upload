'use strict';

// TODO - 1) Add progress support for all and each file.
// TODO - 2) Add supports to other type of files
// TODO - 3) Add supports to the files already uploaded
// TODO - 4) Improve the model to handel images in data base


angular.module('fileUpload',[])
  .factory('imagesService',['FireRef','$firebaseArray',function(FireRef,$firebaseArray){

    var records = $firebaseArray(FireRef.child('images'));

    return {
      images: records,
      //deleteRecord: function (recordKey){
      //  var record = records.$getRecord(recordKey);
      //  record.deleted = true;
      //  return records.$save(record);
      //},
      addRecord: function(object){
        return records.$add(object);
      }
    };

  }])
  .controller('FileUploadController', ['$scope','$q','rfc4122','imagesService','fileUploadService','$log',function ($scope,$q,rfc4122,imagesService,fileUploadService,$log) {

    //$scope.images = imagesService.images;

    fileUploadService.files().then(function(ifiles) {
      $scope.files  = ifiles;
    });

    $scope.filesLength  = function(){
      return fileUploadService.filesLength();
    };

    $scope.uploadFiles = function(){
      $log.info('uploadFiles was clicked');

      angular.forEach(fileUploadService.files,function(fileObject,reference){

        var referencePromise          = $q.when(reference);
        var fileNamePromise           = $q.when(fileObject.fileName);
        var w600xh600ThumbnailPromise = fileUploadService.generateThumbnail(fileObject.preview,600,600);
        var w200xh200ThumbnailPromise = fileUploadService.generateThumbnail(fileObject.preview,200,200);

        $q.all([referencePromise,fileNamePromise,w200xh200ThumbnailPromise,w600xh600ThumbnailPromise]).then(function(result){
          var reference           = result[0];
          var fileName            = result[1];
          var w200xh200Thumbnail  = result[2];
          var w600xh600Thumbnail  = result[3];

          var record = {
            publicationId:'1',
            reference: reference,
            fileName: fileName,
            thumbnails : {
              w200h200:w200xh200Thumbnail,
              w600h600:w600xh600Thumbnail
            },
            deleted:false
          };

          $log.info('record',record);

          imagesService.addRecord(record).then(function(ref){
            var id = ref.key();
            $log.info('added record with id ' + id);
          },function(error){
            $log.error('Error: ',error);
          },function(requestInfo){
            $log.info('percentComplete: ',requestInfo);
          });

        });

      });

    };

  }])
  .factory('fileUploadService',['$q','rfc4122','$log',function($q,rfc4122,$log){

    /**
     * The ALL files, in queue to upload and those already in server.
     * @type {object}
     * */
    var files     = {};

    /**
     * Copy of files object, used for return the file object to its original state, which it is an empty object '{}'.
     * @type {object}
     * */
    var filesCopy = angular.copy(files);

    /**
     * Conserve aspect ratio of the original region. Useful when shrinking/enlarging
     * images to fit into a certain area.
     * Source:  http://stackoverflow.com/a/14731922
     *
     * @param {Number} srcWidth Source area width
     * @param {Number} srcHeight Source area height
     * @param {Number} maxWidth Nestable area maximum available width
     * @param {Number} maxHeight Nestable area maximum available height
     * @return {Object} { width, height }
     */
    var calculateAspectRatioFit = function (srcWidth, srcHeight, maxWidth, maxHeight) {
      var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
      return { width: srcWidth*ratio, height: srcHeight*ratio };
    };

    return {
      /**
       * how many files there are
       * @return Promise.<Object>
       * */
      files: function(){
        return $q.when(files);
      },
      /**
       * how many files there are
       * @return {Number}
       * */
      filesLength : function(){
        return Object.keys(files).length;
      },
      /**
       Receives one FILE type object, which is added or "pushed" to the files object. Later, we can get that object with the reference that return the success
       promise. The reference is UUID (https://en.wikipedia.org/wiki/Universally_unique_identifier).
       @param {File} file
       @returns Promise.<String>
       **/
      newFile : function(file){
        var deferred = $q.defer();
        var uuid    = rfc4122.v4();
        // creating file object
        files[uuid]          = {
          file:     file,
          fileName: file.name,
          fileSize: file.size,
          preview:  'images/loading.jpeg'
        };
        if(files[uuid]){
          deferred.resolve(uuid); // reference
        }else{
          deferred.reject('Undefined reference, check rfc4122 dependence file is loaded.');
        }
        return deferred.promise;
      },
      /**
       Receives the reference (UUID) of the FILE object in files object. Create FileReader instance to read the file with that reference.
       @param  {String} reference is UUID string.
       @returns  Promise.<String> . The Reading is a base64 string.
       **/
      readFile : function(reference){
        var deferred = $q.defer();
        var reader = new FileReader();
        reader.onerror = function(error){
          // The reading operation encounter an error.
          deferred.reject(error);
        };
        reader.onload = function (loadEvent) {
          // The reading operation is successfully completed.
          deferred.resolve(loadEvent.target.result);
        };
        reader.readAsDataURL(files[reference].file);
        return deferred.promise;
      },
      /**
       Receives the reference (UUID), and the Reading result of the FILE object in files object.
       @param {String} reference is UUID string
       @param {reading} reading is base64 string
       @returns Promise.<String>
       **/
      updateFileObj : function(reference,reading){
        return $q.when(files[reference].preview = reading);
      },
      /**
       TODO Remove ALL files, in queue to upload and those already in server.
       @returns Promise.<String>
       **/
      removeFiles : function(){
        var deferred = $q.defer();
        if(angular.copy(filesCopy, files)){
          deferred.resolve('All queue files has been removed successfully.');
        }
        return deferred.promise;
      },
      /**
       TODO Remove the file with the reference provided in queue to upload or one that it is in the server.
       @returns Promise.<String>
       **/
      removeFile : function(reference){
        var deferred = $q.defer();
        var fileName = files[reference].fileName;
        if(delete files[reference]){
          var message = 'The file: '+ fileName +', has been removed successfully.';
          deferred.resolve(message);
        }
        return deferred.promise;
      },
      /**
       Reduce imagen size and quality.
       @param {String} imagen is a base64 string
       @param {Number} width
       @param {Number} height
       @returns Promise.<String>
       **/
      generateThumbnail : function(imagen, width, height){
        var deferred          = $q.defer();
        var canvasElement     = document.createElement('canvas');
        var imagenElement     = document.createElement('img');
        imagenElement.onload  = function(){
          var  dimensions = calculateAspectRatioFit(imagenElement.width,imagenElement.height,width,height);
          canvasElement.width   = dimensions.width;
          canvasElement.height  = dimensions.height;
          var context           = canvasElement.getContext('2d');
          context.drawImage(imagenElement, 0, 0, dimensions.width, dimensions.height);
          deferred.resolve(canvasElement.toDataURL('image/jpeg', 0.7));
        };
        imagenElement.src = imagen;
        return deferred.promise;
      }
    };

  }])
  /**
   * @name fileUpload Directive
   * @Description  Take the last files specified by the User.
   * */
  .directive('fileUpload',['$q','fileUploadService','$log',function($q,fileUploadService,$log){
    return {
      restrict: 'E',
      templateUrl: 'fileUpload.html',
      replace:true,
      link: function (scope,element) {
        fileUploadService.fileInputElement = element;
        element.on('change', function (event) {
          angular.forEach(event.target.files,function(file){
            fileUploadService.newFile(file)
              .then(function(reference){
                // read file
                return $q.all({reference: $q.when(reference), reading: fileUploadService.readFile(reference)});
              }).then(function(the){
                // update file object
                fileUploadService.updateFileObj(the.reference,the.reading);
              },
              function(error){
                $log.error('Error: ',error);
              });
          });
        });
      }
    };
  }])
  /**
   @name fileUploadTrigger
   @Description  Triggers click event on file Input Element.
   */
  .directive('fileUploadTrigger',['fileUploadService',function(fileUploadService){
    return {
      restrict: 'A',
      link: function (scope,element) {
        element.bind('click', function () {
          fileUploadService.fileInputElement.click();
        });
      }
    };
  }])
  /**
   @name removeAllQueueFiles
   @Description  return files object to original state.
   */
  .directive('removeFiles',['fileUploadService','notificationService',function(fileUploadService,notificationService){
    return {
      restrict: 'A',
      scope:{
        successMessage:'@'
      },
      link: function (scope,element) {
        element.bind('click', function () {
          fileUploadService.removeFiles().then(function(message){
            scope.successMessage = scope.successMessage ? scope.successMessage : message;
            notificationService.success(scope.successMessage);
          });
        });
      }
    };
  }])
  /**
   @name removeFileFromTheQueueFiles
   @Description  delete the specified file object in files object.
   */
  .directive('removeFile',['fileUploadService','notificationService',function(fileUploadService,notificationService){
    return {
      restrict: 'A',
      scope:{
        successMessage:'@'
      },
      link: function (scope,element,attributes) {
        element.bind('click', function () {
          fileUploadService.removeFile(attributes['removeFile']).then(function(message){
            scope.successMessage = scope.successMessage ? scope.successMessage : message;
            notificationService.success(scope.successMessage);
          });
        });
      }
    };
  }]);
