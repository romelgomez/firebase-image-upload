'use strict';

angular.module('fileUpload',[])
  .controller('FileUploadController', ['$scope','$q','rfc4122','$window','$log',function ($scope,$q,rfc4122,$window,$log) {

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
      var promise = deferred.promise;
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
        deferred.reject('Undefined reference, check rfc4122 dependence file is loared.');
      }
      return promise;
    };

    /**
     * @name readFile
     * @Description  Receives the reference (UUID) of the FILE object in queueFiles object. Create FileReader instance to read the file with that reference.
     * @parameters   {reference: UUID Type}
     * @returns      promise; The success promise return the Reading, is type string.
     * */
    var readFile =function(reference){
      var deferred = $q.defer();
      var promise = deferred.promise;
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
      return promise;
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
     * */
    $scope.uploadFiles = function(){
      $log.info('uploadFiles was clicked');

      //reduceImagenSizeAndQuality('http://i.imgur.com/SHo6Fub.jpg',100).then(function(result){
      //  $log.info(result);
      //});

    };

    //function imageToDataUri(img, width, height) {
    //  // create an off-screen canvas
    //  var canvas = document.createElement('canvas'),
    //    context = canvas.getContext('2d');
    //  // set its dimension to target size
    //  canvas.width = width;
    //  canvas.height = height;
    //  // draw source image into the off-screen canvas:
    //  context.drawImage(img, 0, 0, width, height);
    //  // encode image to data-uri with base64 version of compressed image
    //  return canvas.toDataURL();
    //}

    var reduceImagenSizeAndQuality = function(img,MAX_HEIGHT){
      //var deferred = $q.defer();
      //var promise = deferred.promise;
      //
      //var imagen = new $window.Image();
      //imagen.on('load',function () {
      //  //var canvas   = angular.element('canvas');
      //  //canvas.width = width;
      //  //canvas.height = height;
      //  //
      //  //var context  = canvas.getContext('2d');
      //  //context.scale(width,  height);
      //  //context.drawImage(img, 0, 0);
      //
      //  if(image.height > MAX_HEIGHT) {
      //    image.width *= MAX_HEIGHT / image.height;
      //    image.height = MAX_HEIGHT;
      //  }
      //  var context = canvas.getContext("2d");
      //  context.clearRect(0, 0, canvas.width, canvas.height);
      //  canvas.width = image.width;
      //  canvas.height = image.height;
      //  context.drawImage(image, 0, 0, image.width, image.height);
      //
      //  deferred.resolve(canvas.toDataURL());
      //});
      //image.src = img;
      //return promise;
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
