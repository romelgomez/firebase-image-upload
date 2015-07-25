angular.module('ngUpload',[])
  .directive('ngUpload', ['$window','$log',function ($window,$log) {


    //myDropzone.on("addedfile", function(file) {
    //  file.previewElement.addEventListener("click", function() {
    //    myDropzone.removeFile(file);
    //  });
    //});

    var controller = function ($scope){

      //$scope.firstFiles = function(){
      //  $log.log('ok');
      //};

      //$scope.continueUpload   = false;
      //$scope.uploadAllButton  = false;

      //$scope.dropZoneConfig = {
      //  options: {
      //    url: 'upload.php',
      //    previewsContainer: '#previews',  // Define the container to display the previews
      //    clickable: '.clickable',         // Define the element that should be used as click trigger to select files.
      //    paramName: 'image',              // The name that will be used to transfer the file
      //    maxFilesize: 10,                 // MB
      //    acceptedFiles: 'image/*',
      //    autoQueue: false,
      //    //previewTemplate: layout,
      //    init: function() {
      //
      //      $scope.$watch(function(scope) { return scope.dropZoneInstance; },
      //        function() {
      //          //$log.log('$scope.dropZone ',$scope.dropZoneInstance);
      //
      //        }
      //      );
      //
      //    }
      //  },
      //  eventHandlers: {
      //    'addedfile': function (file) {
      //
      //      //$scope.firstFiles();
      //      //$log.log('getFilesWithStatus',$scope.dropZoneInstance.getFilesWithStatus(Dropzone.ADDED));
      //      //removeButton(myDropzone,file);
      //
      //
      //    },
      //    'sending': function (file, xhr, formData) {
      //      //formData.append("product_id", $('#ProductId').val());
      //    },
      //    'success': function (file, response) {
      //    },
      //    'error': function (file, error, response) {
      //    }
      //  }
      //};

    };

    return {
      restrict: 'E',
      template: '<input name="file" type="file" multiple />',
      transclude: true,
      scope: {},
      controller:controller,
      link: function(scope, element) {

        //scope.$watch(function() { return element; },
        //  function() {
        //    //$log.log('$scope.dropZone ',$scope.dropZoneInstance);
        //  }
        //);

      }
    };
  }]);
