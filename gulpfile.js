var gulp = require('gulp');
var uglify = require('gulp-uglify'); // https://www.npmjs.com/package/gulp-uglify

/**
 * uglify the scripts files.
* */
gulp.task('compressScripts', function() {
  return gulp.src('public/assets/scripts/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('dist/assets/scripts'));
});

gulp.task('default', [
  'compressScripts'
]);

