var gulp = require('gulp');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var rename = require('gulp-rename');
var babel = require('gulp-babel');
//var mainBowerFiles = require('gulp-main-bower-files');
//var gulpFilter = require('gulp-filter');
//var flatten = require('gulp-flatten');
//var useref = require('gulp-useref');
var cleanCss = require('gulp-clean-css');
var gulpif = require('gulp-if');
var debug = require('gulp-debug');
var sequence = require('gulp-sequence');
var del = require('del');

var paths = {
    source: {
        base: './source/',
        sass: [
            './source/css/*.scss'
        ],
        images: [
            './source/images/**/*'
        ],
        css: ['./source/css/*.css'],
        js: [
            './source/lib/jquery.event.move-master/js/jquery.event.move.js',
            './source/lib/jquery.event.swipe-master/js/jquery.event.swipe.js',
            './source/js/jquery.sx-media-gallery.js'
        ],
        lib: {
            path: './source/lib/',
            js: {
                minified: [
                    './source/lib/jquery/dist/jquery.min.js',
                    './source/lib/pdfobject/pdfobject.min.js'
                ]
            }
        }
    },
    output: {
        base: './dist/',
        css: './dist/css/',
        fonts: './dist/fonts/',
        images: './dist/images/',
        js: './dist/js/'
    },
    bower: {
        path: './bower_components/',
        config: './bower.json',
        overrides: {},
        extras: ['./bower_components/_extras/**']
    }
};

gulp.task('sass', function () {
    return gulp.src(paths.input.sass)
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest(paths.output.css));
});

gulp.task('clean', function () {
    return del(paths.output.base);
});

gulp.task('css.source', function () {
    return gulp.src(paths.source.css)
        .pipe(concat('jquery.sx-media-gallery.css'))
        .pipe(gulp.dest(paths.output.css))
        .pipe(rename({extname: '.min.css'}))
        .pipe(sourcemaps.init())
        .pipe(cleanCss())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.output.css));
});

gulp.task('css', ['css.source']);

gulp.task('js.source', function () {
    return gulp.src(paths.source.js)
        .pipe(babel({presets: ['es2015']}))
        .pipe(concat('jquery.sx-media-gallery.js'))
        .pipe(gulp.dest(paths.output.js))
        .pipe(rename({extname: '.min.js'}))
        .pipe(sourcemaps.init())
        .pipe(uglify({preserveComments: 'license'}))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.output.js));
});

gulp.task('js.lib.minified', function () {
    return gulp.src(paths.source.lib.js.minified)
        .pipe(gulp.dest(paths.output.js));
});

gulp.task('js', ['js.source', 'js.lib.minified']);

gulp.task('build', sequence('clean', ['js', 'css']));

//Watch task
gulp.task('default', ['build']);