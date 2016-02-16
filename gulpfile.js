'use strict';

var gulp    = require('gulp');
var size    = require('gulp-size');
var eslint  = require('gulp-eslint');
var del     = require('del');
var uglify  = require('gulp-uglify');
var gulpif = require('gulp-if');
var concat = require('gulp-concat');

function lint(files, options) {
  return function() {
    return gulp.src(files)
      .pipe(eslint(options))
      .pipe(eslint.format('stylish') );
  };
}

gulp.task('lint', lint('public/assets/scripts/**/*.js'));

//gulp.task('html', ['styles'], function() {
//  return gulp.src('public/*.html')
//    .pipe($.if('*.js', uglify()))
//    .pipe($.if('*.css', minifyCss({compatibility: '*'})))
//    .pipe(assets.restore())
//    .pipe($.if('*.html', minifyHtml({conditionals: true, loose: true})))
//    .pipe($.useref())
//    .pipe(gulp.dest('dist'));
//});

//gulp.task('files', function() {
//  return gulp.src('public/**/*.*', { base: 'public' })
//    .pipe(gulpif('*.js', uglify()))
//    .pipe(gulp.dest('dist'));
//});

gulp.task('scripts', function() {
  return gulp.src('public/**/*.js')
    .pipe(uglify())
    .pipe(concat('all.js'))
    .pipe(gulp.dest('dist'));
});

//gulp.task('files', function() {
//  return gulp.src('public/**/*.*', { base: 'public' })
//    .pipe(gulpif('*.js', uglify()))
//    .pipe(concat('all.js'))
//    .pipe(gulp.dest('dist'));
//});

gulp.task('build', ['lint','scripts'], function() {
  return gulp.src('dist/**/*')
    .pipe(size({title: 'build', gzip: true}));
});


gulp.task('clean', del.bind(null, ['dist']));

gulp.task('default', ['clean'], function() {
  gulp.start('build');
});


/*

 https://www.npmjs.com/package/uglify-js
 https://www.npmjs.com/package/jslint
 https://www.npmjs.com/package/gulp-size
 https://github.com/gulpjs/gulp/blob/master/docs/API.md
 https://github.com/gulpjs/gulp
 http://localhost:8080/#/
 https://www.npmjs.com/package/del
 http://gulpjs.com/plugins/
 https://www.npmjs.com/package/gulp-csslint/
 https://www.npmjs.com/package/gulp-csso/
 https://www.npmjs.com/package/gulp-concat/
 https://www.npmjs.com/package/gulp-main-bower-files
 https://www.npmjs.com/search?q=if
 https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md
 https://www.npmjs.com/package/gulp-eslint/
 https://www.npmjs.com/package/gulp-inject
 http://blog.rangle.io/angular-gulp-bestpractices/
 http://stackoverflow.com/questions/30567322/how-to-gulp-build-index-html-reference-assets-with-absolute-paths
 http://stackoverflow.com/questions/24807797/how-to-use-gulp-to-inject-to-an-html-file-the-links-for-the-installed-bower-pack?rq=1
 https://github.com/klei/gulp-inject

 */