// generated on 2015-12-23 using generator-gulp-webapp 1.0.3
var gulp = require('gulp');
var gulpLoadPlugins = require('gulp-load-plugins');
var browserSync = require('browser-sync');
var del = require('del');
var wiredep = require('wiredep');

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

gulp.task('styles', function(){
  return gulp.src('public/assets/styles/*.scss')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.sass.sync({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['.']
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer({browsers: ['last 1 version']}))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('.tmp/assets/styles'))
    .pipe(reload({stream: true}));
});


function lint(files, options) {
  return function() {
    return gulp.src(files)
      .pipe(reload({stream: true, once: true}))
      .pipe($.eslint(options))
      .pipe($.eslint.format('stylish') )
      .pipe($.if(!browserSync.active, $.eslint.failAfterError()))
  };
}
const testLintOptions = {
  env: {
    mocha: true
  }
};

gulp.task('lint', lint('public/assets/scripts/**/*.js'));
gulp.task('lint:test', lint('test/spec/**/*.js', testLintOptions));

gulp.task('html', ['styles'], function() {
  //const assets = $.useref.assets({searchPath: ['.tmp', 'public', '.']});

  return gulp.src('public/*.html')
    //.pipe(assets)
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.minifyCss({compatibility: '*'})))
    //.pipe(assets.restore())
    .pipe($.if('*.html', $.minifyHtml({conditionals: true, loose: true})))
    .pipe($.useref())
    .pipe(gulp.dest('dist'));
});

gulp.task('images', function() {
  return gulp.src('public/assets/images/**/*')
    .pipe($.if($.if.isFile, $.cache($.imagemin({
        progressive: true,
        interlaced: true,
        // don't remove IDs from SVGs, they are often used
        // as hooks for embedding and styling
        svgoPlugins: [{cleanupIDs: false}]
      }))
      .on('error', function (err) {
        console.log(err);
        this.end();
      })))
    .pipe(gulp.dest('dist/assets/images'));
});

gulp.task('fonts', function() {
  return gulp.src(require('main-bower-files')({
      filter: '**/*.{eot,svg,ttf,woff,woff2}'
    }).concat('public/assets/fonts/**/*'))
    .pipe(gulp.dest('.tmp/assets/fonts'))
    .pipe(gulp.dest('dist/assets/fonts'));
});

gulp.task('extras', function() {
  return gulp.src([
    'public/*.*',
    '!public/*.html',
    'public/assets/components/*.*'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'));
});

gulp.task('components', function() {
  return gulp.src('public/assets/components/*.*')
    .pipe(gulp.dest('dist/assets/components/'));
});

//gulp.task('classicStyles', function() {
//  return gulp.src('public/assets/styles/**/*.css')
//    .pipe(plumber())
//    .pipe(minifyCss())
//    .pipe(gulp.dest('dist/assets/styles'))
//    .pipe(livereload());
//});

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('serve', ['styles', 'fonts'], function() {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['.tmp', 'public'],
      routes: {
        '/bower_components': 'bower_components'
      }
    }
  });

  gulp.watch([
    'public/assets/*.html',
    'public/assets/scripts/**/*.js',
    'public/assets/images/**/*',
    '.tmp/assets/fonts/**/*'
  ]).on('change', reload);

  gulp.watch('public/assets/styles/**/*.scss', ['styles']);
  gulp.watch('public/assets/fonts/**/*', ['fonts']);
  gulp.watch('bower.json', ['wiredep', 'fonts']);
});

gulp.task('serve:dist', function() {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['dist']
    }
  });
});

gulp.task('serve:test', function() {
  browserSync({
    notify: false,
    port: 9000,
    ui: false,
    server: {
      baseDir: 'test',
      routes: {
        '/bower_components': 'bower_components'
      }
    }
  });

  gulp.watch('test/spec/**/*.js').on('change', reload);
  gulp.watch('test/spec/**/*.js', ['lint:test']);
});

// inject bower components
gulp.task('wiredep', function() {
  gulp.src('public/assets/styles/*.scss')
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)+/
    }))
    .pipe(gulp.dest('public/assets/styles'));

  gulp.src('public/*.html')
    .pipe(wiredep({
      exclude: ['bootstrap-sass'],
      ignorePath: /^(\.\.\/)*\.\./
    }))
    .pipe(gulp.dest('public'));
});

gulp.task('build', ['lint', 'html', 'images', 'fonts', 'extras'], function() {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', ['clean'], function() {
  gulp.start('build');
});

//
//
///*******************************************************************************
// 1. DEPENDENCIES
// *******************************************************************************/
//
////https://gist.github.com/samuelhorn/8743217#file-gulpfile-js-L5
//// https://www.youtube.com/watch?v=Blqaio9HaHA
//
//var gulp = require('gulp');
//var uglify = require('gulp-uglify'); // https://www.npmjs.com/package/gulp-uglify
//var sass = require('gulp-ruby-sass'); // https://github.com/sindresorhus/gulp-ruby-sass
//var minifyCss = require('gulp-minify-css'); // https://www.npmjs.com/package/gulp-minify-css/
//var plumber = require('gulp-plumber'); // https://www.npmjs.com/package/gulp-plumber/   --> error handler
//var livereload = require('gulp-livereload'); // https://www.npmjs.com/package/gulp-livereload/
//var imagemin = require('gulp-imagemin'); // https://www.npmjs.com/package/gulp-imagemin/
//var htmlmin = require('gulp-htmlmin');
//
////var gulp = require('gulp');                             // gulp core
////var sass = require('gulp-sass');                        // sass compiler
////var uglify = require('gulp-uglify');                    // uglifies the js <https://www.npmjs.com/package/gulp-uglify>
////var jshint = require('gulp-jshint');                    // check if js is ok
////var rename = require("gulp-rename");                    // rename files
////var concat = require('gulp-concat');                    // concatinate js
////var notify = require('gulp-notify');                    // send notifications to osx
////var plumber = require('gulp-plumber');                  // disable interuption
////var stylish = require('jshint-stylish');                // make errors look good in shell
////var minifycss = require('gulp-minify-css');             // minify the css files
////var browserSync = require('browser-sync');              // inject code to all devices
////var autoprefixer = require('gulp-autoprefixer');        // sets missing browserprefixes
//
///*******************************************************************************
// 2. FILE DESTINATIONS (RELATIVE TO ASSSETS FOLDER)
// *******************************************************************************/
//
//var target = {
//  sass_src : 'public/assets/styles/**/*.scss',                      // all sass files
//  css_src :  'public/assets/styles/**/*.css',                       // all css files
//  css_dest : 'dist/assets/styles/',                                 // where to put minified css
//  html_src: [
//    'public/index.html',
//    'public/assets/views/**/*.html'
//  ],
//  html_dest:'',
//  js_lint_src : [                                     // all js that should be linted
//    'js/build/app.js',
//    'js/build/custom/switch.js',
//    'js/build/custom/scheme-loader.js'
//  ],
//  js_uglify_src : [                                   // all js files that should not be concatinated
//    'js/build/custom/scheme-loader.js',
//    'js/build/vendor/modernizr.js'
//  ],
//  js_concat_src : [                                   // all js files that should be concatinated
//    'js/build/custom/switch.js',
//    'js/build/app.js'
//  ],
//  js_dest : 'js'                                      // where to put minified js
//};
//
//gulp.task('scripts', function() {
//  return gulp.src('public/assets/scripts/**/*.js')
//    .pipe(plumber())
//    .pipe(uglify())
//    .pipe(gulp.dest('dist/assets/scripts'))
//    .pipe(livereload());
//});
//
///**
// * https://www.youtube.com/playlist?list=PL2CB1F80266E986EA
// * https://www.youtube.com/watch?v=wz3kElLbEHE
// * http://stackoverflow.com/questions/32967345/typeerror-glob-pattern-string-required
// * */
//gulp.task('sassStyles', function() {
//  return sass('public/assets/styles/**/*.scss' ,{
//    style: 'compressed'
//  })
//    .pipe(plumber())
//    .pipe(gulp.dest('dist/assets/styles'))
//    .pipe(livereload());
//});
//
//gulp.task('classicStyles', function() {
//  return gulp.src('public/assets/styles/**/*.css')
//    .pipe(plumber())
//    .pipe(minifyCss())
//    .pipe(gulp.dest('dist/assets/styles'))
//    .pipe(livereload());
//});
//
//gulp.task('images', function() {
//  return gulp.src('public/assets/images/**/*')
//    .pipe(imagemin())
//    .pipe(gulp.dest('dist/assets/images'));
//});
//
//gulp.task('watch', function(){
//  //livereload.listen(); // uncomment to use livereload
//  gulp.watch('public/assets/scripts/**/*.js', ['scripts']);
//  gulp.watch('public/assets/scripts/**/*.scss', ['sassStyles']);
//  gulp.watch('public/assets/scripts/**/*.css', ['classicStyles']);
//  gulp.watch('public/assets/images/**/*', ['images']);
//});
//
//gulp.task('default', [
//  'scripts',
//  'sassStyles',
//  'classicStyles',
//  'images',
//  'watch'
//]);