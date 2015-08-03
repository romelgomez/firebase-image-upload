'use strict';

angular.module('fileUpload',[])
  .factory('imagesService',['FireRef','$firebaseArray',function(FireRef,$firebaseArray){

    var records = $firebaseArray(FireRef.child('images'));

    return {
      images: records,
      deleteRecord: function (recordKey){
        var record = records.$getRecord(recordKey);
        record.deleted = true;
        return records.$save(record);
      },
      addRecord: function(object){
        return records.$add(object);
      }
    };

  }])
  .controller('FileUploadController', ['$scope','$q','rfc4122','imagesService','$log',function ($scope,$q,rfc4122,imagesService,$log) {

    $scope.images = imagesService.images;

    /**
     * @name formFiles
     * @Description  The LAST files specified by the User.
     * @Type array
     * */
    $scope.formFiles   = [];

    /**
     * @name queueFiles
     * @Description  The ALL files specified by the User To upload.
     * @Type object
     * */
    $scope.queueFiles  = {};

    /**
     * @name queueFiles
     * @Description return the Length of $scope.queueFiles object
     * @Type object
     * */
    $scope.queueFilesLength  = function(){
      return Object.keys($scope.queueFiles).length;
    };

    /**
     * @Description  Watch changes in formFiles array, to add to queueFiles object the the last files specified by the User.
     * */
    $scope.$watch(function(scope) { return scope.formFiles; },
      function() {
        angular.forEach($scope.formFiles,function(file){
          addFile(file)
            .then(function(reference){
              // read file
              var referencePromise  = $q.when(reference);
              var reading           = readFile(reference);
              return $q.all([referencePromise,reading]);
            })
            .then(function(arrayData){
              // update file object
              var reference = arrayData[0];
              var reading   = arrayData[1];
              updateFileObj(reference,reading);
            },function(error){
                $log.error('Error: ',error);
            });
        });
      }
    );

    /**
     * @name addFile
     * @Description  Receives one FILE type object, which is added or "pushed" to the queueFiles object. Later, we can get that object with the reference that return the success
     * promise. The reference is UUID (https://en.wikipedia.org/wiki/Universally_unique_identifier).
     * @parameters   {file: FILE Type}
     * @returns      promise; The success promise return UUID string;
     * */
    var addFile = function (file) {
      var deferred = $q.defer();
      var uuid    = rfc4122.v4();
      // creating file object
      $scope.queueFiles[uuid]          = {
        file:     file,
        fileName: file.name,
        fileSize: file.size,
        preview:  'images/loading.jpeg'
      };
      if($scope.queueFiles[uuid]){
        deferred.resolve(uuid); // reference
      }else{
        deferred.reject('Undefined reference, check rfc4122 dependence file is loaded.');
      }
      return deferred.promise;
    };

    /**
     * @name readFile
     * @Description  Receives the reference (UUID) of the FILE object in queueFiles object. Create FileReader instance to read the file with that reference.
     * @parameters   {reference: UUID Type}
     * @returns      promise; The success promise return the Reading, is type string.
     * */
    var readFile =function(reference){
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
      reader.readAsDataURL($scope.queueFiles[reference].file);
      return deferred.promise;
    };

    /**
     * @name updateFileObj
     * @Description  Receives the reference (UUID), and the Reading result of the FILE object in queueFiles object.
     * @parameters   {reference: UUID Type, reading: String Type}
     * @returns      undefined
     * */
    var updateFileObj = function(reference,reading){
      $scope.queueFiles[reference].preview = reading;
    };

    /**
     * @name removeAllQueueFiles
     * @Description  return queueFiles object to original state.
     * @parameters   {}
     * @returns      undefined
     * */
    $scope.removeAllQueueFiles = function(){
      $scope.queueFiles = {};
    };

    /**
     * @name removeFileFromTheQueueFiles
     * @Description  delete the specified file object in queueFiles object.
     * @parameters   {reference: UUID Type}
     * @returns      undefined
     * */
    $scope.removeFileFromTheQueueFiles = function(reference){
      delete $scope.queueFiles[reference];
    };

    /**
     * @name selectFiles
     * @Description  Triggers event click on fileInputElement element expose by the directive in the scope.
     * @parameters   {}
     * @returns      undefined
     * */
    $scope.selectFiles = function(){
      $scope.fileInputElement.click();
    };

    /**
     * @name uploadFiles
     * @Description
     * @parameters   {}
     * @returns      undefined
     * TODO - Add progress support for all and each file
     * */
    $scope.uploadFiles = function(){
      $log.info('uploadFiles was clicked');

      angular.forEach($scope.queueFiles,function(fileObject,reference){

        var referencePromise          = $q.when(reference);
        var fileNamePromise           = $q.when(fileObject.fileName);
        var w600xh600ThumbnailPromise = generateThumbnail(fileObject.preview,600,600);
        var w200xh200ThumbnailPromise = generateThumbnail(fileObject.preview,200,200);

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
            $log.info("added record with id " + id);
          },function(error){
            $log.error('Error: ',error);
          },function(requestInfo){
            $log.info('percentComplete: ',requestInfo);
          });

        });

      });

    };

    /**
     * @name generateThumbnails
     * @Description  reduce imagen size and quality.
     * @parameters   {imagen: base64, width: int, height: int}
     * @returns      promise
     * */
    var generateThumbnail = function(imagen, width, height){
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
    };

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


  }])
  /**
   * @name fileUpload Directive
   * @Description  Take the last files specified by the User.
   * */
  .directive('fileUpload',[function(){
    return {
      restrict: 'E',
      templateUrl: 'fileUpload.html',
      replace:true,
      scope: {
        files:'=',
        fileInputElement:'='
      },
      link: function (scope,element) {
        scope.fileInputElement = element;
        element.on('change', function (event) {
          scope.files = event.target.files;
          scope.$apply();
        });
      }
    };
  }]);
