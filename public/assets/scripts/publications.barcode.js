publicationsModule
  .directive('barcodeImg', ['$compile', '$window',function ($compile, $window) {

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

          scope.$watch(function(){
            return scope.barcodeString;
          },function(barcode){
            $window.JsBarcode(element.find(tagUsed), barcode, scope.barcodeOptions);
          });

        }

      }
    }}])
  .directive('barcode', ['$window', function($window) {
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

          // if barcodeImg directive is not set, only validated the barcode
          if (typeof element === "undefined") {
            element = document.createElement('div');
          }

          $window.JsBarcode(element, input, scope.barcodeOptions, isValid);
          return result;
        };

      }
    };
  }])
  .directive('barcodeInput', ['rfc4122', function(rfc4122){

    return {
      restrict: 'E',
      scope:{
        formName:'=',
        inputModel:'=',
        selectModel:'='
      },
      template:'' +
      '<hr class="hr-xs">'+

      '<div class="row">'+
        '<div class="col-xs-8">'+
          '<label><i class="fa fa-barcode"></i> Barcode</label>'+
          '<div class="row" style="margin-bottom: 10px;">'+
            '<div class="col-xs-5">'+
              '<select class="form-control" ng-model="selectModel" ng-change="formName.barcode.$dirty = true; formName.barcode.$pristine = false; inputModel = \'\';">'+
                '<option ng-repeat="barcode in barcode.types" value="{{barcode.type}}">{{barcode.title}}</option>'+
              '</select>'+
            '</div>'+
            '<div class="col-xs-5">'+
              '<button ng-show="selectModel === \'CODE128\'" class="btn btn-default" type="button" ng-click="setBarcodeCODE128Randomly(); formName.barcode.$dirty = true; formName.barcode.$pristine = false;">Set one CODE128 type randomly</button>'+
            '</div>'+
          '</div>'+
          '<div class="form-group" style="margin-bottom: 10px;">'+
            '<input name="barcode" ng-model="inputModel" required barcode barcode-options="barcode.options" class="form-control" placeholder="<Place here the bar code>" type="text">'+
          '</div>'+
          '<div data-ng-messages="(formName.$submitted && formName.barcode.$error) || (formName.barcode.$dirty && formName.barcode.$error)" class="help-block">'+
            '<div data-ng-message="required">'+
            '- The <b>barcode</b> is required.'+
            '</div>'+
            '<div data-ng-message="barcode">'+
            '- The <b>barcode </b> must be valid.'+
            '</div>'+
          '</div>'+
          '<barcode-img ng-show="!formName.barcode.$error.barcode"></barcode-img>'+
        '</div>'+
      '</div>' +
      '<div class="alert alert-info alert-xs" style="margin-bottom: 0; margin-top: 10px;" role="alert">NOTE: The <b>barcode</b> is obligatory for all type of publications, if you don\'t have one, you can set one CODE128 type randomly, with the barcode you and the clients can track this publication in many ways, and other publications they can maybe have the same barcode.</div>',
      link:function(scope){

        scope.barcode = {
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

        scope.setBarcodeCODE128Randomly = function(){
          scope.inputModel = rfc4122.v4()
        };

        scope.$watch(function(){
          return scope.selectModel;
        },function(value){
          scope.barcode.options.format = value;
        });

      }
    };

  }]);

