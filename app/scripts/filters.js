'use strict';

/**
 Special thanks to: http://www.regexr.com/, for being of great help to test this regular expressions.

 The MIT License (MIT)
 Copyright (c) 2015 Romel Javier Gomez Herrera

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.

 **/

angular.module('filters',[])
  /**
   @Name         capitalize
   @Description  All first letters of each word are capital letters.

     {{ 'Your best days are not behind you; your best days are out in front of you.' | capitalize }} // Your Best Days Are Not Behind You; Your Best Days Are Out In Front Of You.

   @parameters   string
   @returns      string
   */
  .filter('capitalize', [function() {
    return function(input) {
      return (!!input) ? input.replace(/([^\W_]+[^\s-]*) */g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}) : '';
    };
  }])
  /**
   @Name         slug or lispCase
   @Description  All letters are downCased and spaces and specialChars are replaced by hyphens '-'.

     {{ 'Your best days are not behind you; your best days are out in front of you.' | slug }} // your-best-days-are-not-behind-you-your-best-days-are-out-in-front-of-you

   @parameters   string
   @returns      string
   */
  .filter('slug', [function() {
    return function(input) {
      return (!!input) ? String(input).toLowerCase().replace(/[^a-zá-źA-ZÁ-Ź0-9]/g, ' ').trim().replace(/\s{2,}/g, ' ').replace(/\s+/g, '-') : '';
    };
  }])
  /**
   @Name         noSpecialChars
   @Description  All special chars are replaced by spaces.
   @parameters   {element: reference of DOM element, data: object}
   @returns      null
   */
  .filter('noSpecialChars', function() {
    return function(input) {
      return (!!input) ? String(input).replace(/[^a-zá-źA-ZÁ-Ź0-9]/g, ' ').trim().replace(/\s{2,}/g, ' ') : '';
    };
  })
  /**
   @Name         capitalizeFirstChar
   @Description  receives one string like: 'hello word' and return 'Hello word'
   @parameters   string
   @returns      string
   */
  .filter('capitalizeFirstChar', [function() {
    return function(input) {
      return (!!input) ? input.trim().replace(/(^\w?)/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1);}) : '';
    };
  }])
  /**
   @Name         dateParse
   @Description  Add one more step before apply the 'date' filter of angular. The raw data is first passed through Date.parse(input) before apply the 'date' filter of angular.

       Date.parse('2015-01-19 14:12:15')  // 1421692935000

       JavaScript Example:
       var created = '2015-01-19 14:12:15';
       $scope.created = $filter('dateParse')(created,'dd/MM/yyyy - hh:mm a');
       {{created}} // 19/01/2015 - 02:12 PM

       For more ifo see the API https://docs.angularjs.org/api/ng/filter/date

   @parameters   {input: raw data, format: date format, timezone: optional}
   @returns      string
   */
  .filter('dateParse', ['$window','$filter',function($window,$filter) {
    return function(input,format,timezone) {
      return (!!input) ? $filter('date')( $window.Date.parse(input), format, timezone) : '';
    };
  }])
  /**
   @Name         stringReplace
   @Description  Replace part of the string.

      JavaScript Example:
      var partOfTheUrl   = 'search-angular-filters';
      $scope.searchString   = $filter('stringReplace')(partOfTheUrl,'search-','');
      {{searchString}} // angular-filters

   @parameters   {string: haystack, changeThis: needle, forThis: new needle}
   @returns      string
   */
  .filter('stringReplace', [function() {
    return function(string,changeThis,forThis) {
      return string.split(changeThis).join(forThis);
    };
  }])
  /**
   @Name         reverse
   @Description  receives one array like: [1,2,3] and return [3,2,1]
   @parameters   array
   @returns      array
   */
  .filter('reverse', [function() {
    return function(items) {
      return angular.isArray(items)? items.slice().reverse() : [];
    };
  }])
  /**
   @Name         camelCase
   @Description  receives one string like: 'hello word' and return 'helloWord'
   @parameters   string
   @returns      string
   */
  .filter('camelCase', [function() {
    return function(input) {
      return  (!!input) ? input.trim().replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) { if (+match === 0){ return ''; } return index === 0 ? match.toLowerCase() : match.toUpperCase(); }) : '';
    };
  }])
  /**
   @Name         lispCaseToCamelCase
   @Description  receives one string like: 'hello-word' and return 'helloWord'
   @parameters   string
   @returns      string
   */
  .filter('lispCaseToCamelCase', [function() {
    return function(input) {
      return  (!!input) ? input.trim().replace(/[\-_](\w)/g, function(match) { return match.charAt(1).toUpperCase(); }) : '';
    };
  }])
  /**
   * AngularJS byte format filter
   * Source: https://gist.github.com/thomseddon/3511330
   */
  .filter('bytes', [function() {
    return function(bytes, precision) {
      if (isNaN(parseFloat(bytes)) || !isFinite(bytes)){ return '-'; }
      if (typeof precision === 'undefined'){ precision = 1; }
      var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
        number = Math.floor(Math.log(bytes) / Math.log(1024));
      return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) +  ' ' + units[number];
    };
  }]);
