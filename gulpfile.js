var gulp = require('gulp');
var gulpLoadPlugins = require('gulp-load-plugins');
var del = require('del');

const $ = gulpLoadPlugins();

function lint(files, options) {
  return function() {
    return gulp.src(files)
      .pipe($.eslint(options))
      .pipe($.eslint.format('stylish') );
  };
}

gulp.task('lint', lint('public/assets/scripts/**/*.js'));
gulp.task('lint:test', lint('test/spec/**/*.js', {
  env: {
    mocha: true
  }
}));

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('build', ['lint'], function() {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', ['clean'], function() {
  gulp.start('build');
});
