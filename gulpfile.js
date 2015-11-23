var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var minifycss = require('gulp-minify-css');
var Server = require('karma').Server;
var jshint = require('gulp-jshint');
var connect = require('gulp-connect');

var distRoot = 'dist';
var appRoot = 'src';
var testRoot = 'src/tests';
var libRoot = 'bower_components';

var appJs = appRoot + '/js';
var appCss = appRoot + '/css';

// *******************************************

gulp.task('buildApp', function(){
  // return gulp.src(['src/js/config.js', 'src/js/**/*.js'])
  return gulp.src([appJs + '/config.js', appJs + '/**/*.js'])
    .pipe(concat('app.js'))
    // .pipe(uglify())
    .pipe(gulp.dest('dist'))
    .pipe(connect.reload());
});

gulp.task('buildVendor', function(){
  return gulp.src([
    libRoot + '/jquery/dist/jquery.min.js',
    libRoot + '/angular/angular.min.js',
    libRoot + '/**/*.min.js'])
    .pipe(concat('vendors.js'))
    // .pipe(uglify())
    .pipe(gulp.dest('dist'));
});

gulp.task('buildCSS', function(){
  return gulp.src([
    libRoot + '/bootstrap/dist/css/bootstrap.css',
    libRoot + '/angular/*.css',
    appCss  + '/**/*.css'])
  .pipe(concat('styles.css'))
  .pipe(minifycss())
  .pipe(gulp.dest('dist'))
  .pipe(connect.reload());
});

gulp.task('moveHTML', function(){
  return gulp.src(appRoot + '/**/*.html')
    .pipe(gulp.dest('dist'))
    .pipe(connect.reload());
});

gulp.task('build', ['buildApp', 'buildVendor', 'buildCSS', 'moveHTML']);

// **********************************

gulp.task('karma', function (done) {
  new Server({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done).start();
});

gulp.task('jshint', function(){
  return gulp.src([appJs + '/**/*.js', testRoot + '/**/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('test', ['karma', 'jshint']);

// ***************************************

gulp.task('connect', function(){
  connect.server({
    root: 'dist',
    livereload: true
  });
});

gulp.task('watch', function(){
  gulp.watch(appJs   + '/**/*.js', ['buildApp', 'test']);
  gulp.watch(appCss  + '/**/*.css', ['buildCSS']);
  gulp.watch(appRoot + '/**/*.html', ['moveHTML']);
  gulp.watch(testRoot + '/**/*.js', ['test']);
});

// *******************************************

gulp.task('default', ['build', 'test', 'watch', 'connect']);
