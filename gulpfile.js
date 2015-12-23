/*******************************************************************************
 1. DEPENDENCIES
 *******************************************************************************/

//https://gist.github.com/samuelhorn/8743217#file-gulpfile-js-L5

var gulp = require('gulp');
var uglify = require('gulp-uglify'); // https://www.npmjs.com/package/gulp-uglify
var sass = require('gulp-ruby-sass'); // https://github.com/sindresorhus/gulp-ruby-sass
var minifyCss = require('gulp-minify-css'); // https://www.npmjs.com/package/gulp-minify-css/
var plumber = require('gulp-plumber'); // https://www.npmjs.com/package/gulp-plumber/   --> error handler
var livereload = require('gulp-livereload'); // https://www.npmjs.com/package/gulp-livereload/
var imagemin = require('gulp-imagemin'); // https://www.npmjs.com/package/gulp-imagemin/
var htmlmin = require('gulp-htmlmin');

//var gulp = require('gulp');                             // gulp core
//var sass = require('gulp-sass');                        // sass compiler
//var uglify = require('gulp-uglify');                    // uglifies the js <https://www.npmjs.com/package/gulp-uglify>
//var jshint = require('gulp-jshint');                    // check if js is ok
//var rename = require("gulp-rename");                    // rename files
//var concat = require('gulp-concat');                    // concatinate js
//var notify = require('gulp-notify');                    // send notifications to osx
//var plumber = require('gulp-plumber');                  // disable interuption
//var stylish = require('jshint-stylish');                // make errors look good in shell
//var minifycss = require('gulp-minify-css');             // minify the css files
//var browserSync = require('browser-sync');              // inject code to all devices
//var autoprefixer = require('gulp-autoprefixer');        // sets missing browserprefixes

/*******************************************************************************
 2. FILE DESTINATIONS (RELATIVE TO ASSSETS FOLDER)
 *******************************************************************************/

var target = {
  sass_src : 'public/assets/styles/**/*.scss',                      // all sass files
  css_src :  'public/assets/styles/**/*.css',                       // all css files
  css_dest : 'dist/assets/styles/',                                 // where to put minified css
  html_src: [
    'public/index.html',
    'public/assets/views/**/*.html'
  ],
  html_dest:'',
  js_lint_src : [                                     // all js that should be linted
    'js/build/app.js',
    'js/build/custom/switch.js',
    'js/build/custom/scheme-loader.js'
  ],
  js_uglify_src : [                                   // all js files that should not be concatinated
    'js/build/custom/scheme-loader.js',
    'js/build/vendor/modernizr.js'
  ],
  js_concat_src : [                                   // all js files that should be concatinated
    'js/build/custom/switch.js',
    'js/build/app.js'
  ],
  js_dest : 'js'                                      // where to put minified js
};

gulp.task('scripts', function() {
  return gulp.src('public/assets/scripts/**/*.js')
    .pipe(plumber())
    .pipe(uglify())
    .pipe(gulp.dest('dist/assets/scripts'))
    .pipe(livereload());
});

/**
 * https://www.youtube.com/playlist?list=PL2CB1F80266E986EA
 * https://www.youtube.com/watch?v=wz3kElLbEHE
 * http://stackoverflow.com/questions/32967345/typeerror-glob-pattern-string-required
 * */
gulp.task('sassStyles', function() {
  return sass('public/assets/styles/**/*.scss' ,{
      style: 'compressed'
    })
    .pipe(plumber())
    .pipe(gulp.dest('dist/assets/styles'))
    .pipe(livereload());
});

gulp.task('classicStyles', function() {
  return gulp.src('public/assets/styles/**/*.css')
    .pipe(plumber())
    .pipe(minifyCss())
    .pipe(gulp.dest('dist/assets/styles'))
    .pipe(livereload());
});

gulp.task('images', function() {
  return gulp.src('public/assets/images/**/*')
    .pipe(imagemin())
    .pipe(gulp.dest('dist/assets/images'));
});

gulp.task('watch', function(){
  //livereload.listen(); // uncomment to use livereload
  gulp.watch('public/assets/scripts/**/*.js', ['scripts']);
  gulp.watch('public/assets/scripts/**/*.scss', ['sassStyles']);
  gulp.watch('public/assets/scripts/**/*.css', ['classicStyles']);
  gulp.watch('public/assets/images/**/*', ['images']);
});

gulp.task('default', [
  'scripts',
  'sassStyles',
  'classicStyles',
  'images',
  'watch'
]);