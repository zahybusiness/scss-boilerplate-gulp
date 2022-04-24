/**
 * Gulp file to automate the various tasks
 */

const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();
const cleanCss = require('gulp-clean-css');
const del = require('del');
const htmlmin = require('gulp-htmlmin');
const cssbeautify = require('gulp-cssbeautify');
const npmDist = require('gulp-npm-dist');
const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const rename = require('gulp-rename');
const wait = require('gulp-wait');
const sourcemaps = require('gulp-sourcemaps');
const fileinclude = require('gulp-file-include');
const rtlcss = require('gulp-rtlcss');
const pkg = require('./package.json');
const year = new Date().getFullYear();


// Define paths
const paths = {
    dist: {
        base: './dist/',
        css: './dist/css',
        html: './dist/html',
        assets: './dist/assets',
        vendor: './dist/vendor',
    },
    dev: {
        base: './html/',
        css: './html/css',
        assets: './html/assets',
        partials: './html/partials/',
        scss: './html/scss',
        vendor: './html/vendor'
    },
    base: {
        base: './',
        node: './node_modules'
    },
    src: {
        base: './src/',
        css: './src/css',
        html: './src/html/**/*.html',
        assets: './src/assets/**/*.*',
        partials: './src/partials',
        scss: './src/scss',
        node_modules: './node_modules/',
        vendor: './vendor'
    },
    temp: {
        base: './.temp/',
        css: './.temp/css',
        html: './.temp/html',
        assets: './.temp/assets',
        vendor: './.temp/vendor'
    }
}

// Compile SCSS
gulp.task('scss', function () {
    return gulp.src([paths.src.scss + '/**/*.scss', paths.src.scss + '/zahy.scss'])
        .pipe(wait(500))
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            overrideBrowserslist: ['> 1%']
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.temp.css))
        .pipe(browserSync.stream());
});



gulp.task('html', function () {
    return gulp.src([paths.src.html])
        .pipe(fileinclude({
            prefix: '@@',
            basepath: paths.src.partials
        }))
        .pipe(gulp.dest(paths.temp.base))
        .pipe(browserSync.stream());
});


gulp.task('assets', function () {
    return gulp.src([paths.src.assets])
        .pipe(gulp.dest(paths.temp.assets))
        .pipe(browserSync.stream());
});

gulp.task('vendor', function () {
    return gulp.src(npmDist(), { base: paths.src.node_modules })
        .pipe(gulp.dest(paths.temp.vendor));
});

gulp.task('serve', gulp.series('scss', 'html', 'assets', 'vendor', function () {
    browserSync.init({
        server: paths.temp.base
    });

    gulp.watch([paths.src.scss + '/**/*.scss', paths.src.scss + '/zahy.scss'], gulp.series('scss'));
    gulp.watch([paths.src.html], gulp.series('html'));
    gulp.watch([paths.src.assets], gulp.series('assets'));
    gulp.watch([paths.src.vendor], gulp.series('vendor'));
}));

gulp.task('clean:rtl', function () {
    return del([paths.temp.css + '/*rtl.css']);
});

/* css rtl */
gulp.task('rtl:css', function () {
    return gulp.src(paths.temp.css + '/*.css')
        .pipe(rtlcss())
        .pipe(rename((path) => {
            path.basename += '.rtl'
        }))
        .pipe(gulp.dest(paths.temp.css))
});


// Beautify CSS
gulp.task('beautify:css', function () {
    return gulp.src([
        paths.dev.css + '/zahy.css'
    ])
        .pipe(cssbeautify())
        .pipe(gulp.dest(paths.dev.css))
});

// Minify CSS
gulp.task('minify:css', function () {
    return gulp.src([
        paths.dist.css + '/zahy.css'
    ])
    .pipe(cleanCss())
    .pipe(gulp.dest(paths.dist.css))
});


// Minify Html
gulp.task('minify:html', function () {
    return gulp.src([paths.dist.html + '/**/*.html'])
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(gulp.dest(paths.dist.html))
});


// Clean
gulp.task('clean:dev', function () {
    return del([paths.dev.base]);
});

gulp.task('clean:dist', function () {
    return del([paths.dist.base]);
});


// Compile and copy scss/css
gulp.task('copy:dev:css', function () {
    return gulp.src([paths.src.scss + '/**/*.scss', paths.src.scss + '/zahy.scss'])
        .pipe(wait(500))
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            overrideBrowserslist: ['> 1%']
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.dev.css))
});

gulp.task('copy:dist:css', function () {
    return gulp.src([paths.src.scss + '/**/*.scss', paths.src.scss + '/zahy.scss'])
        .pipe(wait(500))
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            overrideBrowserslist: ['> 1%']
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.dist.css))
});


// Copy Html
gulp.task('copy:dev:html', function () {
    return gulp.src([paths.src.html])
        .pipe(fileinclude({
            prefix: '@@',
            basepath: paths.src.partials
        }))
        .pipe(gulp.dest(paths.dev.html))
        .pipe(browserSync.stream());
});

gulp.task('copy:dist:html', function () {
    return gulp.src([paths.src.html])
        .pipe(fileinclude({
            prefix: '@@',
            basepath: paths.src.partials
        }))
        .pipe(gulp.dest(paths.dist.html))
        .pipe(browserSync.stream());
});


// Copy assets
gulp.task('copy:dev:assets', function () {
    return gulp.src(paths.src.assets)
        .pipe(gulp.dest(paths.dev.assets))
});

gulp.task('copy:dist:assets', function () {
    return gulp.src(paths.src.assets)
        .pipe(gulp.dest(paths.dist.assets))
});




// Copy node_modules
gulp.task('copy:dev:vendor', function() {
    return gulp.src(npmDist(), { base: paths.src.node_modules })
      .pipe(gulp.dest(paths.dev.vendor));
});

gulp.task('copy:dist:vendor', function() {
    return gulp.src(npmDist(), { base: paths.src.node_modules })
      .pipe(gulp.dest(paths.dist.vendor));
});


//gulp
gulp.task('build:rtl', gulp.series('clean:rtl','rtl:css'));
gulp.task('build:dev', gulp.series('clean:dev', 'copy:dev:css', 'copy:dev:html', 'copy:dev:assets', 'beautify:css', 'copy:dev:vendor'));
gulp.task('build:dist', gulp.series('clean:dist', 'copy:dist:css', 'copy:dist:html', 'copy:dist:assets', 'minify:css', 'minify:html', 'copy:dist:vendor'));

// Default
gulp.task('default', gulp.series('serve'));

