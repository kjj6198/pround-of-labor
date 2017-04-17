var gulp     = require('gulp');
var connect = require('gulp-connect');

var markdown = require('gulp-markdown');
var sass     = require('gulp-sass');
var postcss  = require('gulp-postcss');
var rename   = require('gulp-rename');

var cssnano = require('cssnano');

gulp.task('postcss', function() {
  
  var cssnext = require('postcss-cssnext');
  

  var processors = [cssnext];

  return gulp.src('./src/sexy.scss')
             .pipe(sass().on('error', sass.logError))
             .pipe(postcss(processors))
             .pipe(gulp.dest('./dist'));
});

gulp.task('minify', ['postcss'],function() {
  gulp.src('./dist/sexy.css')
      .pipe(postcss([cssnano]))
      .pipe(rename({
        suffix: '.min'
      }))
      .pipe(gulp.dest('./dist'))
});

gulp.task('connect', function() {
  connect.server({
    root: './',
    livereload: true
  });
});



gulp.task('watch', function() {
  gulp.watch('./src/**/*.scss', ['postcss']);
});



