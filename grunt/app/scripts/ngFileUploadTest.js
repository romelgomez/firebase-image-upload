angular.module('NgFileUploadTest',['ngFileUpload'])
  .controller('NgFileUploadTestController',['$scope', 'Upload', '$timeout', function ($scope, Upload, $timeout){

    $scope.uploadPic = function(file) {

      file.upload = Upload.upload({
        url: 'https://angular-file-upload-cors-srv.appspot.com/upload',
        method: 'POST',
        headers: {
          'my-header': 'my-header-value'
        },
        fields: {username: $scope.username},
        file: file,
        fileFormDataName: 'myFile'
      });

      file.upload.then(function (response) {
        $timeout(function () {
          file.result = response.data;
        });
      }, function (response) {
        if (response.status > 0) {
          $scope.errorMsg = response.status + ': ' + response.data;
        }
      });

      file.upload.progress(function (evt) {
        // Math.min is to fix IE which reports 200% sometimes
        file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
      });
    }

  }]);
