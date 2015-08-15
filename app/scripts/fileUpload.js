'use strict';

/**
 * NOTAS:
 *
 * Hay dos tipos de archivos, los que están en cola, y los que están en el servidor. solo los archivos que estan el cola debe
 * presentar tal comportamiento <progressbar>. En ese sentido se debe poder identificar cuáles archivos están en cola.
 *
 * Cuando borramos un archivo, este puede estar en cola o en el servidor, una vez más necesitamos un identificador con el cual
 * determinemos si ese archivo esta en cola o en el servidor. Si está en el servidor, realizamos una solicitud http,
 * si se tiene éxito, se borra del object files, si esta en cola simplemente se borra de files object
 *
 * */

// TODO - Improve the model to handel images in data base
// TODO - Add progress support for all and each file.
// TODO - Add supports to other type of files
// TODO - Add supports to the files already uploaded
// TODO - Remove ALL files, in queue to upload and those already in server.
// TODO - Remove THE file, in queue to upload or that it is already in the server.


angular.module('fileUpload',['ngProgress'])
  .factory('fireBaseService',[function(){

    /******* FireBase Data Base Structure  *******

     Publications Path:
     publications/fireBaseUniqueIdentifier/images/uuid/deleted
     publications/fireBaseUniqueIdentifier/images/uuid/name

     publications:{
              fireBaseUniqueIdentifier:{
                title:'publication title',
                description:'publication description',
                images:{
                  uuid:{
                    name:'file name',
                    isDeleted:false
                  },
                  uuid:{
                    name:'file name',
                    isDeleted:false
                  },
                  uuid:{
                    name:'file name',
                    isDeleted:true
                  }
                }
              }
            }

     Images Paths:
     images/uuid/thumbnails/w200xh200
     images/uuid/thumbnails/w600xh600

     images:{
              uuid:{
                thumbnails:{
                  w200xh200:'base64 string',
                  w600xh600:'base64 string'
                }
              }
            }

     **/

    return {};

  }])
  .controller('FileUploadController', ['$scope','$q','rfc4122','FireRef','$firebaseObject','fileUploadService','ngProgressFactory','$log',function ($scope,$q,rfc4122,FireRef,$firebaseObject,fileUploadService,ngProgressFactory,$log) {

    var fixedFireBaseUniqueIdentifier = '-Juqip8bcmF7u3z97fbe';
    var publicationImagesRef = FireRef.child('publications').child(fixedFireBaseUniqueIdentifier).child('images');
    var publicationImagesObj = $firebaseObject(publicationImagesRef);

    fileUploadService.files().then(function(_files_) {
      $scope.files  = _files_;
    });

    $scope.filesLength  = function(){
      return fileUploadService.filesLength();
    };

    $scope.progressInstances = {};

    $scope.uploadFiles = function(){
      $log.info('uploadFiles was clicked');

      fileUploadService.files().then(function(files) {
        angular.forEach(files,function(fileObject,reference){

          var promises = {
            reference:          $q.when(reference),
            fileName:           $q.when(fileObject.fileName),
            w200xh200Thumbnail: fileUploadService.generateThumbnail(fileObject.preview,200,200,0.7),
            w600xh600Thumbnail: fileUploadService.generateThumbnail(fileObject.preview,600,600,1.0)
          };

          $q.all(promises).then(function(the){
            var reference           = the.reference;
            var fileName            = the.fileName;
            var w200xh200Thumbnail  = the.w200xh200Thumbnail;
            var w600xh600Thumbnail  = the.w600xh600Thumbnail;

            var imagesRef = FireRef.child('images').child(reference);

            var imageObj = $firebaseObject(imagesRef);
            imageObj.name = fileName;
            imageObj.thumbnails = {};
            imageObj.thumbnails.w200xh200 = w200xh200Thumbnail;
            imageObj.thumbnails.w600xh600 = w600xh600Thumbnail;

            $scope.progressInstances[reference] = imageObj.$save().then(function(ref) {
              var reference = ref.key();
              $log.info('added record with id ' + reference);
              fileUploadService.updateFileObj(reference,{inServer:true});
            }, function(error) {
              $log.error('Error: ',error);
            });

            publicationImagesObj[reference]           = {};
            publicationImagesObj[reference].name      = fileName;
            publicationImagesObj[reference].isDeleted = false;
            publicationImagesObj.$save()

          });

        });
      });

    };

    var filesInServer = function(){

      publicationImagesObj.$watch(function() {
        angular.forEach(publicationImagesObj,function(fileObj,reference){
          if(!fileObj.isDeleted){
            if(!angular.isDefined($scope.files[reference])){

              //var w200xh200ThumbnailReference = FireRef.child('images').child(reference).child('thumbnails').child('w200xh200');

              var file = {};

              file[reference]          = {
                fileName: fileObj.name,
                preview:  'images/loading.jpeg',
                inServer: true
              };

              $log.info('file',file);

              //fileUploadService.files.push(file);
              //var imageObj  = $firebaseObject(imagesRef);
              //var file = {};
              //file.fileName =  imageObj.name

            }
          }
        });
      });


    };

    filesInServer();

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
       @return Promise.<String>
       **/
      newFile : function(file){
        var deferred = $q.defer();
        var uuid    = rfc4122.v4();
        // creating file object
        files[uuid]          = {
          file:     file,
          fileName: file.name,
          fileSize: file.size,
          preview:  'images/loading.jpeg',
          inServer: false
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
       @return  Promise.<String> . The Reading is a base64 string.
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
       Receives the reference (UUID), and the new data object.
       @param {String} reference is UUID string
       @param {Object} newData
       @return undefined
       **/
      updateFileObj : function(reference,newData){
        angular.forEach(newData, function (value, key) {
          files[reference][key] = value;
        });
      },
      /**
       TODO Remove ALL files, in queue to upload and those already in server.
       @return Promise.<String>
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
       @return Promise.<String>
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
       @param {Number} quality from 0.1 to 1.0
       @return Promise.<String>
       **/
      generateThumbnail : function(imagen, width, height, quality){
        var deferred          = $q.defer();
        var canvasElement     = document.createElement('canvas');
        var imagenElement     = document.createElement('img');
        imagenElement.onload  = function(){
          var  dimensions = calculateAspectRatioFit(imagenElement.width,imagenElement.height,width,height);
          canvasElement.width   = dimensions.width;
          canvasElement.height  = dimensions.height;
          var context           = canvasElement.getContext('2d');
          context.drawImage(imagenElement, 0, 0, dimensions.width, dimensions.height);
          deferred.resolve(canvasElement.toDataURL('image/jpeg', quality));
        };
        imagenElement.src = imagen;
        return deferred.promise;
      }
    };

  }])
  /**
   * The fileUpload Directive Take the last files specified by the User.
   * */
  .directive('fileUpload',['$q','fileUploadService','$log',function($q,fileUploadService,$log){
    return {
      restrict: 'E',
      template: '<input type="file" multiple="multiple" accept="image/*" class="file-input">',
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
                fileUploadService.updateFileObj(the.reference,{preview: the.reading});
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
   * The fileUploadTrigger Directive Triggers click event on file Input Element.
   * */
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
   * The removeFiles return files object to original state.
   * */
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
   * The removeFile directive delete the specified file object in files object.
   * */
  .directive('removeFile',['fileUploadService','notificationService',function(fileUploadService,notificationService){
    return {
      restrict: 'A',
      scope:{
        successMessage:'@'
      },
      link: function (scope,element,attributes) {
        element.bind('click', function () {
          fileUploadService.removeFile(attributes.removeFile).then(function(message){
            scope.successMessage = scope.successMessage ? scope.successMessage : message;
            notificationService.success(scope.successMessage);
          });
        });
      }
    };
  }]);
