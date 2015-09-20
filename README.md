# marketplace

This project is generated with [yo angular generator](https://github.com/yeoman/generator-angular)
version 1.0.0.

## Build & development

Run `grunt` for building and `grunt serve` for preview.

## Testing

Running `grunt test` will run the unit tests with karma.




{
   "public_id":"publications/836bdf53-94bc-4c66-a91f-d2dadb64ae5d",
   "version":1442619005,
   "signature":"9cb01f2573361104ddb4430f13e3b85de4866758",
   "width":1200,
   "height":1200,
   "format":"jpg",
   "resource_type":"image",
   "created_at":"2015-09-18T23:30:05Z",
   "tags":[

   ],
   "bytes":95036,
   "type":"upload",
   "etag":"042010539ba219221e2d43a34ac16bf1",
   "url":"http://res.cloudinary.com/berlin/image/upload/v1442619005/publications/836bdf53-94bc-4c66-a91f-d2dadb64ae5d.jpg",
   "secure_url":"https://res.cloudinary.com/berlin/image/upload/v1442619005/publications/836bdf53-94bc-4c66-a91f-d2dadb64ae5d.jpg",
   "context":{
      "custom":{
         "alt":"06G-P4-3799-KR_XL_6.jpg",
         "caption":"06G-P4-3799-KR_XL_6.jpg",
         "photo":"06G-P4-3799-KR_XL_6.jpg"
      }
   },
   "existing":false,
   "original_filename":"06G-P4-3799-KR_XL_6"
}



/******* FireBase Data Base Structure  *******

 Publications Path:
 publications/fireBaseUniqueIdentifier/images/uuid/isDeleted
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
                  w200xh200:{
                    reference: uuid,
                    base64: 'base64 string'
                  },
                  w600xh600:{
                    reference: uuid,
                    base64: 'base64 string'
                  }
                }
              }
            }

 **/



snapshots of publications
 releases

 cuando el usuario confirma la compra se crea un instantánea de todos los datos.


 [snapshots] luego de presionar <Publish>, y cada vez que el vendedor presione el botón <Update>, se crea una instantánea de la publicación.
 Cuando el cliente confirma el contrato, lo hará sobre la última instantánea guardada. El comprador tendrá derechos y deberes según
 lo especifique la instantánea. Si el vendedor luego modifica la publicación, estará creado otra instantánea o contrato.

 Las modificaciones realizadas a la publicación se reflejarán en todos los clientes que la estén visualizando, tan rápido como la
 latencia de la conexión de internet lo permita.

 <Update> <Pause or Enable> <Delete>
 <Publish> <Discard>

 Publish & Update  -> validate = true;  Valida que las fotos y los campos del formulario esten completos
 Save              -> validate = false; Toma lo que este al momento y guarda
 Pause             -> actualiza un campo
 Enable            -> actualiza un campo
 Delete            -> actualiza un campo
 Discard           -> actualiza un campo

 publications           snapshots

 category               category
 user
 title                  title
 description            description
 price                  price
 quantity               quantity
 barcode                barcode
 warranty               warranty

 paused                                     true or false
 releaseDate                                Firebase.ServerValue.TIMESTAMP
 deleted                                    true or false
 created  (draft) created (released)        Firebase.ServerValue.TIMESTAMP

 termsOfService

 Main Categories [Market, Jobs] // Real Estate, Vehicles, Boats, Planes, stock market

 <publications> Market

 userId                 string
 categoryId             string
 title                  string
 description            string
 price                  int
 quantity               int
 barcode                string
 warranty               string
 releaseDate            date
 paused                 boolean
 deleted                boolean

 <publications> Jobs

 userId                 string
 categoryId             string
 title                  string
 description            string
 salary
 barcode                string
 releaseDate            date
 paused                 boolean
 deleted                boolean 



## ng-file-upload

<script src="angular.min.js"></script>
<!-- shim is needed to support non-HTML5 FormData browsers (IE8-9)-->
<script src="ng-file-upload-shim.min.js"></script>
<script src="ng-file-upload.min.js"></script>

Upload on form submit or button click

<form ng-app="fileUpload" ng-controller="MyCtrl" name="form">

  Single Image with validations
  <div class="button" ngf-select ng-model="file" name="file" ngf-pattern="'image/*" accept="image/*" ngf-max-size="20MB" ngf-min-height="100">Select</div>

  Multiple files
  <div class="button" ngf-select ng-model="files" ngf-multiple="true">Select</div>

  Drop files: <div ngf-drop ng-model="files" class="drop-box">Drop</div>
  <button type="submit" ng-click="submit()">submit</button>

</form>

Upload right away after file selection:
<div class="button" ngf-select="upload($file)">Upload on file select</div>
<div class="button" ngf-select="uploadFiles($files)" multiple="multiple">Upload on file select</div>

Drop File:
<div ngf-drop="uploadFiles($files)" class="drop-box" ngf-drag-over-class="dragover" ngf-multiple="true" ngf-pattern="'image/*,application/pdf'">Drop Images or PDFs files here</div>
<div ngf-no-file-drop>File Drag/Drop is not supported for this browser</div>


Image thumbnail: <img ngf-src="file || '/thumb.jpg'">
Audio preview: <audio controls ngf-src="file"></audio>
Video preview: <video controls ngf-src="file"></video>



## javascript

//inject directives and services.
var app = angular.module('fileUpload', ['ngFileUpload']);

app.controller('MyCtrl', ['$scope', 'Upload', function ($scope, Upload) {

    // upload later on form submit or something similar
    $scope.submit = function() {
      if (form.file.$valid && $scope.file && !$scope.file.$error) {
        $scope.upload($scope.file);
      }
    });

    // upload on file select or drop
    $scope.upload = function (file) {
        Upload.upload({
            url: 'upload/url',
            fields: {'username': $scope.username},
            file: file
        }).progress(function (evt) {
        
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            
            console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
        
        }).success(function (data, status, headers, config) {
        
            console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
        
        }).error(function (data, status, headers, config) {
        
            console.log('error status: ' + status);
        
        })
    };

    // for multiple files:
    $scope.upload = function (files) {

      if (files && files.length) {
        for (var i = 0; i < files.length; i++) {
          Upload.upload({..., file: files[i], ...})...;
        }
        // or send them all together for HTML5 browsers:
        Upload.upload({..., file: files, ...})...;
      }

    }

}]);



<button ngf-select ng-model="files" ngf-multiple="true" accept="image/*" ngf-keep="true" ngf-keep-distinct="true" ngf-max-size="10MB" ngf-min-height="200" ngf-min-width="200" ngf-validate-force="true" required>Upload</button>
<button ngf-select ng-model="file" accept="image/*" ngf-keep="true" ngf-max-size="10MB" ngf-min-height="200" ngf-min-width="200" ngf-validate-force="true" required>Upload one file</button>
<button ngf-select ng-model="fileCam" ngf-capture="'camera'" accept="image/*" ngf-keep="true" ngf-max-size="10MB" ngf-min-height="200" ngf-min-width="200" ngf-validate-force="true" required>Upload one file from camera</button>


<button ngf-select ng-model="file" accept="image/*" ngf-keep="true" ngf-max-size="10MB" ngf-min-height="200" ngf-min-width="200" ngf-validate-force="true" required>Upload one file</button>
Image thumbnail: <img ngf-src="file || '/images/loading.jpeg.jpg'">

## File select

<button|div|input

type="file"|ngf-select|ngf-select= "upload($files, $file, $event)" // called when files are selected or cleared

ng-model="myFiles" // binds the selected file or files to the scope model

// could be an array or single file depending on ngf-multiple and ngf-keep values.

ngf-change= "upload($files, $file, $event)" // called when files are selected or cleared

ng-disabled="boolean" // disables this element

ngf-select-disabled="boolean" // default true, disables file select on this element

ngf-multiple="boolean" // default false, allows selecting multiple files

ngf-capture="'camera'" or "'other'" // allows mobile devices to capture using camera

accept="image/*" // standard HTML accept attribute for the browser specific popup window filtering

ngf-keep="boolean" // default false, keep the previous ng-model files and append the new files

ngf-keep-distinct="boolean" // default false, if ngf-keep is set, removes duplicate selected files

//validations:

ngf-pattern="'.pdf,.jpg,video/*'" // comma separated wildcard to filter file names and types allowed
// validate error name: pattern

ngf-min-size, ngf-max-size="100" in bytes or "'10KB'" or "'10MB'" or "'10GB'"
// validate as form.file.$error.maxSize=true and file.$error='maxSize'

ngf-min-height, ngf-max-height, ngf-min-width, ngf-max-width="1000" in pixels only images
// validate error name: maxHeight

ngf-ratio="9x6,1.6" list of comma separated valid aspect ratio of images in float or 3x2 format
// validate error name: ratio

ngf-min-duration, ngf-max-duration="100.5" in seconds or "'10s'" or "'10m'" or "'10h'" only audio, video
// validate error name: maxDuration

ngf-validate="{size: {min: 10, max: '20MB'}, width: {min: 100, max:10000}, height: {min: 100, max: 300}, ratio: '2x1', duration: {min: '10s', max: '5m'}, pattern: '.jpg'}"
shorthand form for above validations in one place.

ngf-validate-fn="validate($file)" // custom validation function, return boolean or string containing the error.
// validate error name: validateFn

ngf-validate-async-fn="validate($file)" // custom validation function, return a promise that resolve to
// boolean or string containing the error. validate error name: validateAsyncFn

ngf-validate-force="boolean" // default false, if true file will be rejected if the dimension or duration
// values for validations cannot be calculated for example image cannot load or unsupported video by browser

ngf-validate-later="boolean" // default false, if true model will be set and change will be called before validation

>Upload</button>


## File drop

<div|button|ngf-drop|...

  *ngf-drop= "upload($files, $file, $event)" //called when files being dropped

  ng-model="myFiles" // binds the dropped file or files to the scope model
                     // could be an array or single file depending on ngf-multiple and ngf-keep values.

  ngf-change= "upload($files, $file, $event)" // called when files being dropped

  ng-disabled="boolean" // disables this element

  ngf-drop-disabled="boolean" // default true, disables file drop on this element

  ngf-multiple="boolean" // default false, allows selecting multiple files.

  ngf-allow-dir="boolean" // default true, allow dropping files only for Chrome webkit browser

  ngf-drag-over-class="{accept:'acceptClass', reject:'rejectClass', delay:100}" or "myDragOverClass" or "calcDragOverClass($event)"
              // drag over css class behaviour. could be a string, a function returning class name
              // or a json object {accept: 'c1', reject: 'c2', delay:10}. default "dragover".
              // accept/reject class only works in Chrome validating only the file mime type
              // against ngf-pattern

  ngf-drop-available="dropSupported" // set the value of scope model to true or false based on file
                                     // drag&drop support for this browser

  ngf-stop-propagation="boolean" // default false, whether to propagate drag/drop events.

  ngf-hide-on-drop-not-available="boolean" // default false, hides element if file drag&drop is not

  //validations:
  same as ngf-select see above supported
>
Drop files here
</div>

<div|... ngf-no-file-drop>File Drag/drop is not supported</div>


## File preview

<img|audio|video
  ngf-src="file" //To preview the selected file, sets src attribute to the file data url.

  ngf-background="file" //sets background-image style to the file data url.

  ngf-no-object-url="true or false" // see #887 to force base64 url generation instead of object url. Default false
>

## Upload service:

var upload = Upload.upload({

  *url: 'server/upload/url', // upload.php script, node.js route, or servlet url

  *file: file,  // single file or an array of files (array is for html5 only)

  method: 'POST' or 'PUT'(html5), default POST,

  headers: {'Authorization': 'xxx'}, // only for html5

  fileName: 'doc.jpg' or ['1.jpg', '2.jpg', ...], // to modify the name of the file(s)

  /*
  file formData name ('Content-Disposition'), server side request file parameter name could be
  an array  of names for multiple files (html5). Default is 'file' */
  fileFormDataName: 'myFile' or ['file[0]', 'file[1]', ...],

  /*
  map of extra form data fields to send along with file. each field will be sent as a form field.
  The values are converted to json string or jsob blob or nested form depending on 'sendFieldsAs' option. */
  fields: {key: $scope.myValue, ...},

  /*
  default is 'json', sends each field as json string plain text content type, 'json-blob' sends object fields
  as a blob object with content type 'application/json', 'form' sends fields as nested form fields. see #784 */
  sendFieldsAs: json|json-blob|form,

  /* customize how data is added to the formData. See #40#issuecomment-28612000 for sample code. */
  formDataAppender: function(formData, key, val){},

  /*
  data will be sent as a separate form data field called "data".*/
  data: {},

  withCredentials: true|false,

  ... and all other angular $http() options could be used here.

}).progress(function(evt) {

  console.log('progress: ' + parseInt(100.0 * evt.loaded / evt.total) + '% file :'+ evt.config.file.name);

}).success(function(data, status, headers, config) {

  // file is uploaded successfully
  console.log('file ' + config.file.name + 'is uploaded successfully. Response: ' + data);

}).error(function(data, status, headers, config) {

  // handle error

}).xhr(function(xhr){

  //access or attach event listeners to the underlying XMLHttpRequest
  xhr.upload.addEventListener(...)

});

/* return $http promise then,catch or finally.
Note that this promise does NOT have progress, abort or xhr functions */
var promise = upload.then(success, error, progress);
              upload.catch(errorCallback);
              upload.finally(callback, notifyCallback);

/* cancel/abort the upload in progress. */
upload.abort();

/* alternative way of uploading, send the file binary with the file's content-type.
   Could be used to upload files to CouchDB, imgur, etc... html5 FileReader is needed.
   It could also be used to enable progress for regualr angular $http() post/put requests.
*/
Upload.http({
  url: '/server/upload/url',
  headers : {
    'Content-Type': file.type
  },
  data: file
})

/* Set the default values for ngf-select and ngf-drop directives*/
Upload.setDefaults({ngfMinSize: 20000, ngfMaxSize:20000000, ...})

/* Convert the file to base64 data url*/
Upload.dataUrl(file, disallowObjectUrl).then(function(url){...});

/* Get image file dimensions*/
Upload.imageDimensions(file).then(function(dimensions){console.log(dimensions.widht, dimensions.height);});

/* Geet audio/video duration*/
Upload.mediaDuration(file).then(function(durationInSeconds){...});


ng-model The model value will be a single file instead of an array if all of the followings are true:

-ngf-multiple is not set or is resolved to false.
-multiple attribute is not set on the element
-ngf-keep is not set or is resolved to false.

validation When any of the validation directives specified the form validation will take place and you can access the value of the validation using myForm.myFileInputName.$error.<validate error name> for example form.file.$error.pattern. If multiple file selection is allowed you can find the error of each individual file with file.$error and description of it file.$errorParam. So before uploading you can check if the file is valid by !file.$error.

Upload multiple files: Only for HTML5 FormData browsers (not IE8-9) if you pass an array of files to file option it will upload all of them together in one request. In this case the fileFormDataName could be an array of names or a single string. For Rails or depending on your server append square brackets to the end (i.e. file[]). Non-html5 browsers due to flash limitation will still upload array of files one by one in a separate request. You should iterate over files and send them one by one if you want cross browser solution.

Upload.http(): This is equivalent to angular $http() but allow you to listen to the progress event for HTML5 browsers.

drag and drop styling: For file drag and drop, ngf-drag-over-class could be used to style the drop zone. It can be a function that returns a class name based on the $event. Default is "dragover" string. Only in chrome It could be a json object {accept: 'a', 'reject': 'r', delay: 10} that specify the class name for the accepted or rejected drag overs. The validation ngf-pattern could only check the file type since that is the only property of the file that is reported by the browser on drag. So you cannot validate the file size or name on drag. There is also some limitation on some file types which are not reported by Chrome. delay param is there to fix css3 transition issues from dragging over/out/over #277.

Upload.setDefaults(): If you have many file selects or drops you can set the default values for the directives by calling Upload.setDefaults(options). options would be a json object with directive names in camelcase and their default values.


## Old browsers


For browsers not supporting HTML5 FormData (IE8, IE9, ...) FileAPI module is used. Note: You need Flash installed on your browser since FileAPI uses Flash to upload files.

These two files FileAPI.min.js, FileAPI.flash.swf will be loaded by the module on demand (no need to be included in the html) if the browser does not supports HTML5 FormData to avoid extra load for HTML5 browsers. You can place these two files beside angular-file-upload-shim(.min).js on your server to be loaded automatically from the same path or you can specify the path to those files if they are in a different path using the following script:


<script>
    //optional need to be loaded before angular-file-upload-shim(.min).js
    FileAPI = {
        //only one of jsPath or jsUrl.
        jsPath: '/js/FileAPI.min.js/folder/',
        jsUrl: 'yourcdn.com/js/FileAPI.min.js',

        //only one of staticPath or flashUrl.
        staticPath: '/flash/FileAPI.flash.swf/folder/',
        flashUrl: 'yourcdn.com/js/FileAPI.flash.swf',

        //forceLoad: true, html5: false //to debug flash in HTML5 browsers
        //noContentTimeout: 10000 (see #528)
    }
</script>
<script src="angular-file-upload-shim.min.js"></script>...


Old browsers known issues:

Because of a Flash limitation/bug if the server doesn't send any response body the status code of the response will be always 204 'No Content'. So if you have access to your server upload code at least return a character in the response for the status code to work properly.
Custom headers will not work due to a Flash limitation #111 #224 #129
Due to Flash bug #92 Server HTTP error code 400 will be returned as 200 to the client. So avoid returning 400 on your server side for upload response otherwise it will be treated as a success response on the client side.
In case of an error response (http code >= 400) the custom error message returned from the server may not be available. For some error codes flash just provide a generic error message and ignores the response text. #310
Older browsers won't allow PUT requests. #261


## Server Side

Java You can find the sample server code in Java/GAE here
Spring MVC Wiki Sample provided by zouroto
Node.js Wiki Sample provided by chovy. Another wiki using Express 4.0 and the Multiparty provided by Jonathan White
Rails
Wiki Sample provided by guptapriyank.
Blog post provided by Coshx Labs.
Rails progress event: If your server is Rails and Apache you may need to modify server configurations for the server to support upload progress. See #207
PHP Wiki Sample and related issue only one file in $_FILES when uploading multiple files
.Net Sample client and server code demo/C# provided by AtomStar


## CORS

To support CORS upload your server needs to allow cross domain requests. You can achive that by having a filter or interceptor on your upload file server to add CORS headers to the response similar to this: (sample java code)


httpResp.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS");
httpResp.setHeader("Access-Control-Allow-Origin", "your.other.server.com");
httpResp.setHeader("Access-Control-Allow-Headers", "Content-Type"));

For non-HTML5 IE8-9 browsers you would also need a crossdomain.xml file at the root of your server to allow CORS for flash: (sample xml)

<cross-domain-policy>
  <site-control permitted-cross-domain-policies="all"/>
  <allow-access-from domain="angular-file-upload.appspot.com"/>
  <allow-http-request-headers-from domain="*" headers="*" secure="false"/>
</cross-domain-policy>


## Amazon AWS S3 Upload

The demo page has an option to upload to S3. Here is a sample config options:

Upload.upload({
        url: 'https://angular-file-upload.s3.amazonaws.com/', //S3 upload url including bucket name
        method: 'POST',
        fields : {
          key: file.name, // the key to store the file on S3, could be file name or customized
          AWSAccessKeyId: <YOUR AWS AccessKey Id>,
          acl: 'private', // sets the access to the uploaded file in the bucket: private or public
          policy: $scope.policy, // base64-encoded json policy (see article below)
          signature: $scope.signature, // base64-encoded signature based on policy string (see article below)
          "Content-Type": file.type != '' ? file.type : 'application/octet-stream', // content type of the file (NotEmpty)
          filename: file.name // this is needed for Flash polyfill IE8-9
        },
        file: file,
      });
      
      
This article explains more about these fields and provides instructions on how to generate the policy and signature using a server side tool. These two values are generated from the json policy document which looks like this:      

{"expiration": "2020-01-01T00:00:00Z",
"conditions": [
  {"bucket": "angular-file-upload"},
  ["starts-with", "$key", ""],
  {"acl": "private"},
  ["starts-with", "$Content-Type", ""],
  ["starts-with", "$filename", ""],
  ["content-length-range", 0, 524288000]
]
}


The demo page provide a helper tool to generate the policy and signature from you from the json policy document. Note: Please use https protocol to access demo page if you are using this tool to generate signature and policy to protect your aws secret key which should never be shared.

Make sure that you provide upload and CORS post to your bucket at AWS -> S3 -> bucket name -> Properties -> Edit bucket policy and Edit CORS Configuration. Samples of these two files:


{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "UploadFile",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::xxxx:user/xxx"
      },
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::angular-file-upload/*"
    },
    {
      "Sid": "crossdomainAccess",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::angular-file-upload/crossdomain.xml"
    }
  ]
}


<?xml version="1.0" encoding="UTF-8"?>
<CORSConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
    <CORSRule>
        <AllowedOrigin>http://angular-file-upload.appspot.com</AllowedOrigin>
        <AllowedMethod>POST</AllowedMethod>
        <AllowedMethod>GET</AllowedMethod>
        <AllowedMethod>HEAD</AllowedMethod>
        <MaxAgeSeconds>3000</MaxAgeSeconds>
        <AllowedHeader>*</AllowedHeader>
    </CORSRule>
</CORSConfiguration>


For IE8-9 flash polyfill you need to have a crossdomain.xml file at the root of you S3 bucket. Make sure the content-type of crossdomain.xml is text/xml and you provide read access to this file in your bucket policy.

You can also have a look at https://github.com/nukulb/s3-angular-file-upload for another example with this fix.



      <!--<button id="update"   type="button" class="btn btn-primary"><span class="glyphicon glyphicon-refresh" aria-hidden="true"></span> Update</button>-->
      <!--<button type="button" class="btn btn-default publication-status-button"><span class="glyphicon glyphicon-pause" aria-hidden="true"></span> Pause</button>-->
      <!--<button type="button" class="btn btn-default publication-status-button"><span class="glyphicon glyphicon-play"></span> Enable</button>-->
      <!--<button id="delete"   class="btn btn-danger" type="button"><span class="glyphicon glyphicon-remove-sign" aria-hidden="true"></span> Delete</button>-->

      <!--<button  class="btn btn-primary" type="submit">Enviar</button>-->
      <!--<div id="debugTime" style="padding-top: 10px; ">The publication was updated at <span id="lastTimeSave"></span> (Minutes <span id="minutesElapsed">0</span> ago)</div>-->
      <!--<div id="debugTime" style="padding-top: 10px; ">The draft was updated at <span id="lastTimeSave"></span> (Minutes <span id="minutesElapsed">0</span> ago)</div>-->
