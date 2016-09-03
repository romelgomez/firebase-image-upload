'use strict';

var gulp    = require('gulp');
var size    = require('gulp-size');
var eslint  = require('gulp-eslint');
var del     = require('del');
var uglify  = require('gulp-uglify');
var gulpif = require('gulp-if');
var concat = require('gulp-concat');
var notify = require("gulp-notify");
var nodemon = require("gulp-nodemon");
var htmlmin = require('gulp-htmlmin');
var csso = require('gulp-csso');
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
var autoprefixer = require('gulp-autoprefixer');
var cssnano = require('gulp-cssnano');
var bowerFiles = require('main-bower-files');
var inject = require('gulp-inject');
var es = require('event-stream');
var processhtml = require('gulp-processhtml');
var useref = require('gulp-useref');
var sourcemaps = require('gulp-sourcemaps');
var lazypipe = require('lazypipe');
var gzip = require('gulp-gzip');
var rev = require('gulp-rev');
var revReplace = require('gulp-rev-replace');
var rename = require("gulp-rename");



var src = {
  scripts : 'public/static/assets/scripts/**/*.js',
  styles  : 'public/static/assets/styles/**/*.css',
  images  : 'public/static/assets/images/**/*.*',
  views   : 'public/static/assets/views/**/*.html',
  fonts   : {
    fontAwesome: 'bower_components/font-awesome/fonts/fontawesome-webfont.*',
    bootstrap:   'bower_components/bootstrap/fonts/glyphicons-halflings-regular.*'
  }
};

var output = {
  scripts : 'dist/static/assets/scripts',
  styles  : 'dist/static/assets/styles',
  images  : 'dist/static/assets/images',
  views  : 'dist/static/assets/views',
  fonts  : 'dist/static/assets/fonts',
  dist    : 'dist'
};

gulp.task('lint', function() {
  return gulp.src([
      src.scripts,
      '!public/static/assets/scripts/publications.list.categories.js',
      '!public/static/assets/scripts/publications.list.locations.js',
      '!public/static/assets/scripts/publications.list.categories.routeParameters.js',
      '!public/static/assets/scripts/publications.list.locations.routeParameters.js'
  ])
    .pipe(eslint())
    .pipe(eslint.format('stylish'));
});

gulp.task('views', function () {
  return gulp.src(src.views)
    .pipe(useref({
      base: 'dist'
    }))
    .pipe(gulpif('*.html', htmlmin({collapseWhitespace: true})))
    .pipe(gulp.dest(output.views))
});

gulp.task('images', function () {
  return gulp.src(src.images)
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      use: [pngquant()]
    }))
    .pipe(gulp.dest(output.images))
});

gulp.task('google-site-verification', function() {
  return gulp.src('public/googleb3b941affe88d9b8.html')
    .pipe(gulp.dest(output.dist));
});

gulp.task('sitemap', function() {
  return gulp.src('public/sitemap.txt')
    .pipe(gulp.dest(output.dist));
});

//gulp.task('basic', function() {
//  return gulp.src('public/index1.html')
//    .pipe(useref())
//    .pipe(gulpif('*.js', uglify()))
//    .pipe(gulpif('*.css', csso()))
//    .pipe(rev())
//    .pipe(revReplace())
//    .pipe(gulpif('*.html', htmlmin({collapseWhitespace: true})))
//    .pipe(gulpif('*.html', rename({
//      basename: 'index1',
//      extname: ".html"
//    })))
//    .pipe(gulp.dest(output.dist));
//});

gulp.task('basic', function() {
  return gulp.src('public/index1.html')
    .pipe(useref())
    .pipe(gulpif('*.js', uglify()))
    .pipe(gulpif('*.css', csso()))
    .pipe(gulpif('*.html', htmlmin({collapseWhitespace: true})))
    .pipe(gulp.dest(output.dist));
});

//gulp.task('distributed-dependencies', function() {
//  return gulp.src([
//      'public/static/assets/views/publication.html',
//      'public/static/assets/views/login.html'
//    ])
//    .pipe(useref())
//    .pipe(gulpif('*.js', uglify()))
//    .pipe(gulpif('*.css', csso()))
//    .pipe(gulpif('*.html', htmlmin({collapseWhitespace: true})))
//    .pipe(gulp.dest(output.dist));
//});

gulp.task('fonts', function() {
  return gulp.src([src.fonts.fontAwesome,src.fonts.bootstrap])
    .pipe(gulp.dest(output.fonts));
});

gulp.task('favicon', function() {
  return gulp.src('public/favicon.ico')
    .pipe(gulp.dest(output.dist));
});

gulp.task('robots.txt', function() {
  return gulp.src('public/robots.txt')
    .pipe(gulp.dest(output.dist));
});

gulp.task('manifest.txt', function() {
  return gulp.src('public/manifest.txt')
    .pipe(gulp.dest(output.dist));
});

gulp.task('build', ['lint', 'basic', 'images', 'views', 'fonts', 'favicon', 'robots.txt', 'google-site-verification', 'sitemap', 'manifest.txt'], function() {
  return gulp.src('dist/**/*')
    .pipe(size({title: 'build', gzip: true}));
});

gulp.task('devServer', function () {
  nodemon({
    script: 'server/appDev.js',
    ext: 'js',
    env: { 'NODE_ENV': 'development' }
  })
});

gulp.task('server', function () {
  nodemon({
    script: 'server/app.js',
    ext: 'js',
    env: { 'NODE_ENV': 'production' }
  })
});

gulp.task('clean', del.bind(null, ['dist']));

gulp.task('default', ['clean'], function() {
  gulp.start('build');
});

//gulp.task('files', function() {
//  return gulp.src('public/**/*.*', { base: 'public' })
//    .pipe(gulpif('*.js', uglify()))
//    .pipe(gulp.dest('dist'));
//});

//gulp.task('files', function() {
//  return gulp.src('public/**/*.*', { base: 'public' })
//    .pipe(gulpif('*.js', uglify()))
//    .pipe(concat('all.js'))
//    .pipe(gulp.dest('dist'));
//});

//gulp.task('html', ['styles'], function() {
//  return gulp.src('public/*.html')
//    .pipe($.if('*.js', uglify()))
//    .pipe($.if('*.css', minifyCss({compatibility: '*'})))
//    .pipe(assets.restore())
//    .pipe($.if('*.html', minifyHtml({conditionals: true, loose: true})))
//    .pipe($.useref())
//    .pipe(gulp.dest('dist'));
//});


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