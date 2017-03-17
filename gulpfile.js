var gulp = require('gulp'),
    browserSync = require('browser-sync').create(),
    notify = require("gulp-notify"),
    compass = require('gulp-compass'),
    autoprefix = require('gulp-autoprefixer'),
    rename = require('gulp-rename'),
    useref = require('gulp-useref'),
    gulpIf = require('gulp-if'),
    uglify = require('gulp-uglify'),
    cssnano = require('gulp-cssnano'),
    imagemin = require('gulp-imagemin'),
    cache = require('gulp-cache'),
    del = require('del'),
    runSequence = require('run-sequence');


// ### paths ### //

//** source path
var source = {
    html: 'app/*.html',
    sass: 'app/scss/**/*.scss',
    js: 'app/js/**/*.js',
    fonts: 'app/fonts/**/*',
    fontAwesome: 'app/components/font-awesome/fonts/**.*',
    fontAwesomeSass: './font-awesome/scss',
    images: 'app/images/**/*.+(png|jpg|jpeg|gif|svg)'
}

// ** destination path
var dest = {
    html: 'dist/',
    css: 'dist/css',
    js: 'dist/js',
    fonts: 'dist/fonts',
    fontAwesome: 'app/fonts',
    images: 'dist/images'
}

// ### project config ### //

// ** browser sync
gulp.task('browserSync', function() {
  return browserSync.init({
    server: {baseDir: 'app'},
  })
})

// ** compass
gulp.task('compass', function() {
  return gulp.src([source.sass])
    .pipe(compass({
      sass: 'app/scss',
      css: 'app/css',
      fonts: 'app/fonts',
      require: ['compass/import-once/activate', 'susy', 'ceaser-easing'],
      loadPath: [source.fontAwesomeSass]
  })
    .on("error", notify.onError(function (error) {
         return "Erro: " + error.message;
     }))     
    )
    .pipe(browserSync.reload({stream: true}))
    .pipe(autoprefix({browsers: ['last 2 versions', 'ie >= 9', 'and_chr >= 2.3']}))
    .pipe(cssnano())
    .pipe(rename({suffix: ".min"}))
    .pipe(gulp.dest(dest.css))
})

// ** icons
gulp.task('icons', function() {
    return gulp.src(source.fontAwesome)
        .pipe(gulp.dest(dest.fontAwesome));
});

// ** useref
gulp.task('useref', function(){
  return gulp.src(source.html)
    .pipe(useref())
    .pipe(gulpIf('*.js', uglify()))
    .pipe(gulp.dest('dist'))
});

// ** watch
gulp.task('watch', ['browserSync', 'compass'], function(){
    gulp.watch(source.sass, ['compass']); 
    gulp.watch(source.html, browserSync.reload); 
    gulp.watch(source.js, browserSync.reload); 
})

// ### optimization ### //

// ** image min
gulp.task('images', function(){
  return gulp.src(source.images)
  .pipe(cache(imagemin({
      interlaced: true
    })))
  .pipe(gulp.dest(dest.images))
});

// ** copy fonts
gulp.task('fonts', function() {
    return gulp.src(source.fonts)
    .pipe(gulp.dest(dest.fonts))
})

// ** clean
gulp.task('clean', function() {
    return del.sync('dist').then(function(cb) {
        return cache.clearAll(cb);
    });
})

gulp.task('clean:dist', function() {
    return del.sync(['dist/**/*', '!dist/images', '!dist/images/**/*']);
});

// ** build
gulp.task('build', function (callback) {
    runSequence('clean:dist', 
        ['compass', 'fonts', 'icons', 'useref', 'images'],
        callback
    )
})

// ** default
gulp.task('default', function (callback) {
    runSequence(['compass', 'fonts', 'icons', 'useref', 'images','browserSync', 'watch'],
        callback
    )
})