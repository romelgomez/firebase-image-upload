
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
        format: $scope.publication.model.barcodeType,
        displayValue: true,
        font: "monospace",
        textAlign: "center",
        fontSize: 12,
        backgroundColor: "",
        lineColor: "#000"
      }
    };

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

          // if barcodeImg directive is not set, only validated the barcode
          if (typeof element === "undefined") {
            element = document.createElement('div');
          }

          JsBarcode(element, input, scope.barcodeOptions, isValid);
          return result;
        };

      }
    };
  }]);