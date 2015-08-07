'use strict';

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

    fileUploadService.queueFiles().then(function(files) {
      $scope.queueFiles  = files;
    });

    /**
     * @name queueFilesLength
     * @Description return the Length of $scope.queueFiles object
     * @Type object
     * */
    $scope.queueFilesLength  = function(){
      return fileUploadService.queueFilesLength();
    };




    /**
     * @name uploadFiles
     * @Description
     * @parameters   {}
     * @returns      undefined
     * TODO - 1) Add progress support for all and each file;
     * 2) Improve the model,
     * */
    $scope.uploadFiles = function(){
      $log.info('uploadFiles was clicked');

      angular.forEach(fileUploadService.queueFiles,function(fileObject,reference){

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
     * @name queueFiles
     * @Description  The ALL files specified by the User To upload.
     * @Type object
     * */
    var queueFiles        = {};
    var copyOfQueueFiles  = angular.copy(queueFiles);

    /**
     * @name queueFiles
     * @Description return the Length of $scope.queueFiles object
     * @Type object
     * */

    /**
     * Conserve aspect ratio of the orignal region. Useful when shrinking/enlarging
     * images to fit into a certain area.
     * @source  http://stackoverflow.com/a/14731922
     *
     * @param {Number} srcWidth Source area width
     * @param {Number} srcHeight Source area height
     * @param {Number} maxWidth Fittable area maximum available width
     * @param {Number} maxHeight Fittable area maximum available height
     * @return {Object} { width, heigth }
     */
    var calculateAspectRatioFit = function (srcWidth, srcHeight, maxWidth, maxHeight) {
      var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
      return { width: srcWidth*ratio, height: srcHeight*ratio };
    };

    /**
     @name addFile
     @Description  Receives one FILE type object, which is added or "pushed" to the queueFiles object. Later, we can get that object with the reference that return the success
     promise. The reference is UUID (https://en.wikipedia.org/wiki/Universally_unique_identifier).
     @parameters   {file: FILE Type}
     @returns      promise; The success promise return UUID string;
     **/

    /**
     @name readFile
     @Description  Receives the reference (UUID) of the FILE object in queueFiles object. Create FileReader instance to read the file with that reference.
     @parameters   {reference: UUID Type}
     @returns      promise; The success promise return the Reading, is type string.
     **/

    /**
     @name updateFileObj
     @Description  Receives the reference (UUID), and the Reading result of the FILE object in queueFiles object.
     @parameters   {reference: UUID Type, reading: String Type}
     @returns      promise
     **/

    /**
     @name generateThumbnails
     @Description  reduce imagen size and quality.
     @parameters   {imagen: base64, width: int, height: int}
     @returns      promise
     **/

    /**
     @name newFile
     @Description  Receives one FILE type object, which is added or "pushed" to the queueFiles object. Later, we can get that object with the reference that return the success
     promise. The reference is UUID (https://en.wikipedia.org/wiki/Universally_unique_identifier).
     @parameters   {file: FILE Type}
     @returns      promise; The success promise return UUID string;
     **/

    return {
      queueFiles:function(){
        return $q.when(queueFiles);
      },
      queueFilesLength:function(){
        return Object.keys(queueFiles).length;
      },
      newFile:function(file){
        var deferred = $q.defer();
        var uuid    = rfc4122.v4();
        // creating file object
        queueFiles[uuid]          = {
          file:     file,
          fileName: file.name,
          fileSize: file.size,
          preview:  'images/loading.jpeg'
        };
        if(queueFiles[uuid]){
          deferred.resolve(uuid); // reference
        }else{
          deferred.reject('Undefined reference, check rfc4122 dependence file is loaded.');
        }
        return deferred.promise;
      },
      readFile:function(reference){
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
        reader.readAsDataURL(queueFiles[reference].file);
        return deferred.promise;
      },
      updateFileObj : function(reference,reading){
        return $q.when(queueFiles[reference].preview = reading);
      },
      removeAllQueueFiles : function(){
        var deferred = $q.defer();
        if(angular.copy(copyOfQueueFiles, queueFiles)){
          deferred.resolve('All queue files has been removed successfully.');
        }
        return deferred.promise;
      },
      removeFileFromTheQueueFiles : function(reference){
        var deferred = $q.defer();
        var fileName = queueFiles[reference].fileName;
        if(delete queueFiles[reference]){
          var message = 'The file: '+ fileName +', has been removed successfully.';
          $log.info('message',message);
          deferred.resolve(message);
        }
        return deferred.promise;
      },
      generateThumbnail:function(imagen, width, height){
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
   @Description  return queueFiles object to original state.
   */
  .directive('removeAllQueueFiles',['fileUploadService','notificationService',function(fileUploadService,notificationService){
    return {
      restrict: 'A',
      scope:{
        successMessage:'@'
      },
      link: function (scope,element) {
        element.bind('click', function () {
          fileUploadService.removeAllQueueFiles().then(function(message){
            scope.successMessage = scope.successMessage ? scope.successMessage : message;
            notificationService.success(scope.successMessage);
          });
        });
      }
    };
  }])
  /**
   @name removeFileFromTheQueueFiles
   @Description  delete the specified file object in queueFiles object.
   */
  .directive('removeFileFromTheQueueFiles',['fileUploadService','notificationService',function(fileUploadService,notificationService){
    return {
      restrict: 'A',
      scope:{
        reference:'@',
        successMessage:'@'
      },
      link: function (scope,element) {
        element.bind('click', function () {
          fileUploadService.removeFileFromTheQueueFiles(scope.reference).then(function(message){
            scope.successMessage = scope.successMessage ? scope.successMessage : message;
            notificationService.success(scope.successMessage);
          });
        });
      }
    };
  }]);
