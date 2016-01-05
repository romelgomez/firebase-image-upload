
publicationsModule
  .controller('BarcodeController', ['$scope','rfc4122',function($scope,rfc4122){

    $scope.barcode = {
      types: [
        {
          title:'EAN (13)',
          type:'EAN'
        },
        {
          title:'UPC-A',
          type:'UPC'
        },
        {
          title:'CODE39',
          type:'CODE39'
        },
        {
          title:'CODE128',
          type:'CODE128'
        },
        {
          title:'ITF (Interleaved 2 of 5)',
          type:'ITF'
        },
        {
          title:'ITF14',
          type:'ITF14'
        },
        {
          title:'Pharmacode',
          type:'pharmacode'
        }
      ],
      options: {
        width: 1,
        height: 50,
        quite: 10,
        format: 'CODE128',
        displayValue: true,
        font: "monospace",
        textAlign: "center",
        fontSize: 12,
        backgroundColor: "",
        lineColor: "#000"
      }
    };

    $scope.$watch('publication.model.barcodeType', function(value) {
      $scope.publication.model.barcode = '';
      $scope.barcode.options.format = String(value);
    });

    $scope.setBarcodeCODE128Randomly = function(){
      $scope.publication.model.barcode = rfc4122.v4()
    };

  }])
  .directive('barcodeImg', ['$compile', '$window','$log',function ($compile) {

    function isCanvasSupported(){
      var elem = document.createElement('canvas');
      return !!(elem.getContext && elem.getContext('2d'));
    }

    return {
      restrict: 'E',
      scope: {
        barcodeString: '=',
        barcodeOptions: '='
      },
      link: function(scope, element){

        var template = '';
        var tagUsed = '';
        if(isCanvasSupported()){
          template = '<canvas id="barcode-img"></canvas>';
          tagUsed = 'canvas';
        }else{
          template = '<img id="barcode-img">';
          tagUsed = 'img';
        }

        element.html($compile(template)(scope));

        // in case you want to use only this directive for show purposes only
        if (typeof scope.barcodeString !== "undefined") {
          if (typeof scope.barcodeOptions === "undefined") {
            scope.barcodeOptions = {};
          }
          JsBarcode(element.find(tagUsed), scope.barcodeString, scope.barcodeOptions);
        }

      }
    }}])
  .directive('barcode', [function() {
    return {
      restrict:'A',
      require : 'ngModel',
      scope: {
        barcodeOptions: '='
      },
      link : function(scope, element, attrs, ngModel) {
        if (typeof scope.barcodeOptions === "undefined") {
          scope.barcodeOptions = {};
        }

        var result;
        function isValid(_result_){
          result = _result_;
        }

        ngModel.$validators.barcode = function(input) {
          var element = document.getElementById("barcode-img");

          // if barcodeImg is not set, only validated the barcode
          if (typeof element === "undefined") {
            element = document.createElement('div');
          }

          JsBarcode(element, input, scope.barcodeOptions, isValid);
          return result;
        };

      }
    };
  }]);



//barcode-is-valid

//.directive('barcodeIsValid', function() {
//  return {
//    restrict:'A',
//    scope: {
//      isValid: '='
//    },
//    require : 'ngModel',
//    link : function(scope, element, attrs, ngModel) {
//      ngModel.$validators.barcodeIsValid = function() {
//        // A false return value indicates an error
//        return scope.isValid;
//      };
//    }
//  };
//})
// .directive('barcode', ['$compile', '$window','$log',function ($compile, $window, $log) {
//
//   function isCanvasSupported(){
//     var elem = document.createElement('canvas');
//     return !!(elem.getContext && elem.getContext('2d'));
//   }
//
//   //function newBarcode(element){
//   //
//   //}
//
//  return {
//    restrict: 'E',
//    scope: {
//      string: '=',
//      options: '=',
//      isValid: '='
//    },
//    link: function(scope, element){
//
//      var template = '';
//      var tagUsed = '';
//      if(isCanvasSupported()){
//        template = '<canvas></canvas>';
//        tagUsed = 'canvas';
//      }else{
//        template = '<img>';
//        tagUsed = 'img';
//      }
//
//      element.html($compile(template)(scope));
//
//      //scope.$watch('string', function(value) {
//      //});
//      //scope.$watch('options', function(value) {
//      //  $window.JsBarcode(element.find(tagUsed), scope.string, scope.options, isValid);
//      //});
//
//      function isValid(isValid){
//        scope.isValid = isValid;
//      }
//
//      JsBarcode(element.find(tagUsed), scope.string, scope.options, isValid);
//
//
//    }
//  }}]);



//$scope.barcodeString = '74a2e884-053d-471e-b02f-df01a44142d8';
////$scope.barcodeOptions = {
////  width:  1,
////  //format: "EAN"
////};
//
//$scope.isValid = false;
//
//$scope.barcodeType = [
//  {
//    title:'EAN',
//    type:'ean'
//  },
//  {
//    title:'UPC',
//    type:'upc'
//  },
//  {
//    title:'CODE39',
//    type:'code39'
//  },
//  {
//    title:'CODE128b',
//    type:'code128b'
//  },
//  {
//    title:'CODE128c',
//    type:'code128c'
//  },
//  {
//    title:'ITF',
//    type:'itf'
//  },
//  {
//    title:'ITF14',
//    type:'itf14'
//  }
//];
//
//$scope.barcodeOptions = {
//  format: $scope.publication.model.barcodeType,
//  width: 1,
//  height: 50,
//  quite: 10,
//  displayValue: true,
//  font: "monospace",
//  textAlign: "center",
//  fontSize: 12,
//  backgroundColor: "",
//  lineColor: "#000"
//};
//
////$scope.$watch(function(scope){
////  return scope.publication.model.barcodeType;
////},function(){
////  $scope.publication.model.description = $filter('htmlToPlaintext')($scope.publication.model.htmlDescription);
////});
//
//
//$scope.setBarcodeRandomly = function(){
//  $scope.publication.model.barcode = rfc4122.v4()
//};


/*

 <li>barcode:  {{isValid}} </li>

 <div class="form-group">
 <div class="row">
 <div class="col-xs-10">
 <label><i class="fa fa-barcode"></i> Barcode</label>

 <div class="input-group">
 <input name="barcode" ng-model="publication.model.barcode" required barcode-is-valid class="form-control" placeholder="" type="text">
 <span class="input-group-btn">
 <button class="btn btn-default" type="button" ng-click="setBarcodeRandomly()">Set one randomly</button>
 </span>
 </div><!-- /input-group -->

 <select class="form-control" ng-model="publication.model.barcodeType">
 <option ng-repeat="barcode in barcodeType" value="{{barcode.type}}">{{barcode.title}}</option>
 </select>

 <div data-ng-messages="publicationForm.$submitted && publicationForm.quantity.$error" class="help-block">
 <div data-ng-message="required">
 - The <b>quantity</b> is required.
 </div>
 <div data-ng-message="barcodeIsValid">
 - The <b>barcode </b> must be valid.
 </div>
 </div>

 </div>
 </div>
 </div>

 <img id="barcode3"/>
 <script>$("#barcode3").JsBarcode("9780199532179",{format:"EAN",displayValue:true,fontSize:20});</script>

 <barcode data-string="publication.model.barcode" data-options="barcodeOptions" is-valid="isValid"></barcode>

 <barcode data="sas"></barcode>
 {{model.barcodeType}}
 <barcode ng-show="publication.model.barcode!==''" type="{{publication.model.barcodeType}}" string="{{publication.model.barcode}}" options="barcodeOptions"></barcode>

 <img id="barcode1"/>
 <script>$("#barcode1").JsBarcode("Hi!");</script>

 http://angularscript.com/angularjs-directive-for-code-128-barcode-generator/
 https://github.com/search?utf8=%E2%9C%93&q=angular+barcode&type=Repositories&ref=searchresults
 https://github.com/lindell/JsBarcode
 http://stackoverflow.com/questions/28442804/trying-to-make-a-directive-that-uses-jsbarcode
 https://github.com/loicmahieu/angular-io-barcode
 http://lindell.me/JsBarcode/
 https://github.com/goodeggs/angular-barcode-listener
 https://github.com/fumitoito/angularjs-barcodeScanner
 https://plugins.jquery.com/tag/barcode/


 ****************************
 *
 *publicationsModule
 .controller('BarcodeController',[function(){

 }])
 .directive('barcode', ['$q',function($q) {
 return {
 restrict:'A',
 require : 'ngModel',
 link : function(scope, element, attrs, ngModel) {

 var result;
 function isValid(_result_){
 result = _result_;
 }

 ngModel.$validators.barcode = function(input) {

 var element = document.createElement('div');
 JsBarcode(element, input, {
 width:  1,
 format: "EAN"
 }, isValid);

 return result;
 };

 }
 };
 }]);



 */



