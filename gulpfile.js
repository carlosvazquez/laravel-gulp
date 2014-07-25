var gulp          = require('gulp');

var gutil         = require('gulp-util');
var notify        = require('gulp-notify');
//var sass          = require('gulp-ruby-sass');
var sass          = require('gulp-sass')
var autoprefixer  = require('gulp-autoprefixer');
var coffee        = require('gulp-coffee');

var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin');
var pngcrush = require('imagemin-pngcrush');
var sourcemaps = require('gulp-sourcemaps');
var livereload = require('gulp-livereload');
var watch = require('gulp-watch');
//var del = require('del');

var phpunit = require('gulp-phpunit');


//Origin and target files
var sassDir       = './app/assets/sass';
var targetCSSDir  = 'public/css';

// Origin and target files
var coffeeDir     = 'app/assets/coffee';
var targetJSDir   = 'public/js';

// Origin and target images
var imagesDir     = 'app/assets/img';
var targetImagesDir   = 'public/img';

var paths = {
  scripts: ['app/assets/**/*.coffee','app/assets/js/*.js', '!app/assets/vendor/*'],
  images: 'app/assets/img/**/*',
  sass: 'app/assets/sass/styles.scss',
  dest: 'public'
};



// CSS files and SASS SCSS files

gulp.task('styles', function () {
   return gulp.src(paths.sass)
      .pipe(sass({check: false, style: 'expanded'}).on('error', gutil.log))
      .pipe(gulp.dest(targetCSSDir))
      .pipe(notify('CSS compiled, prefixed, and unminified.'))
      .pipe(livereload());
});


gulp.task('scripts', function() {
  // Minify and copy all JavaScript (except vendor scripts)
  // with sourcemaps all the way down
  return gulp.src(paths.scripts)
    .pipe(sourcemaps.init())
      .pipe(coffee())
      .pipe(uglify())
      .pipe(concat('all.min.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(targetJSDir))
    .pipe(notify('JavaScript compiled.'))
    .pipe(livereload());
});

// Copy all static images
gulp.task('images', function() {
  return gulp.src(paths.images)
    // Pass in options to the task
    .pipe(imagemin({
                optimizationLevel: 5,
                progressive: true,
                svgoPlugins: [{removeViewBox: false}],
                use: [pngcrush()]
            }))
    .pipe(gulp.dest(targetImagesDir))
    .pipe(notify('Images optimized.'))
    .pipe(livereload());
});


gulp.task('phpunit', function() {
    var options = {debug: false, notify: true};
    gulp.src('app/**/*.php')
        .pipe(phpunit('', options))
        .on('error', notify.onError({
            title: "Failed Tests!",
            message: "Error(s) occurred during testing..."
        }))
        .pipe(livereload());
});


// Rerun the task when a file changes
gulp.task('watch', function() {
  livereload.listen();
  gulp.watch('public/**').on('change', livereload.changed);
  gulp.watch(sassDir + '/**/*.scss', ['styles']);
  gulp.watch(paths.scripts, ['scripts']);
  gulp.watch(paths.images, ['images']);
  gulp.watch('app/**/*.php', ['phpunit']);
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['watch', 'styles', 'scripts', 'images', 'phpunit']);
