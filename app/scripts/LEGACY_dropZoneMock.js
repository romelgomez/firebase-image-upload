(function() {

  var Dropzone, Emitter, camelize, contentLoaded, detectVerticalSquash, drawImageIOSFix, noop, without,
    __slice = [].slice,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Emitter = (function() {
    function Emitter() {
      console.log('function Emitter is called');
    }


    Emitter.prototype.someEmitterFunction = function (opt) {
       console.log('opt in someEmitterFunction: ',opt);
    };

    return Emitter;

  })();

  Dropzone = (function(_super) {

    __extends(Dropzone, _super);

    Dropzone.prototype.someDropZoneFunction = function (){
      console.log('someDropZoneFunction');
    };

    Dropzone.prototype.Emitter = Emitter;

    function Dropzone(element, options) {
      console.log('element: ',element);
      console.log('options: ',options);

      this.someEmitterFunction(options);
      this.someDropZoneFunction();

      console.log('function Dropzone is called');
      console.log('_super',_super());
    }

    return Dropzone;

  })(Emitter);

  // $('.test').dropzone({a:'A'})
  if (typeof jQuery !== "undefined" && jQuery !== null) {
    jQuery.fn.dropzone = function(options) {
      // this is DOM elements
      return this.each(function() {
        // this is the element
        return new Dropzone(this, options);
      });
    };
  }

  if (typeof module !== "undefined" && module !== null) {
    module.exports = Dropzone;
  } else {
    window.Dropzone = Dropzone;
  }

  Dropzone.getElement = function() {
    console.log('getElement function is called')
  };

}).call(this);
