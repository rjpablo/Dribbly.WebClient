﻿/// <binding BeforeBuild='scss-to-css' />
const gulp = require('gulp');
const merge = require("merge-stream");
const del = require("del");
const rename = require("gulp-rename");
const watch = require("gulp-watch");
const sass = require('gulp-sass');

var paths = {
    baseSrc: 'wwwroot/src/',
    baseDest: 'wwwroot/dest/',
    images: 'images/',
    node: './node_modules/',
    lib: './wwwroot/src/lib/',
    srcDirs: ['lib/', 'lib-extensions/', 'modules/', 'shared/']
};

// used to exclude external libraries from watch since they
// very rarely get updated
var _notLib = '!' + paths.baseSrc + 'lib/**/*';

//Only npm files that are listed here will be inlucde in the build
//REMEMBER: keep alphabetical order
var nodeLibs = {
    jquery: {
        source: 'jquery/dist/jquery.js',
        destination: 'jquery'
    },
    angular: {
        source: 'angular/angular.js',
        destination: 'angular'
    },
    angular_animate: {
        source: 'angular-animate/angular-animate.js',
        destination: 'angular-animate'
    },
    angular_bootstrap_colorpicker: {
        source: [
            'angular-bootstrap-colorpicker/js/bootstrap-colorpicker-module.js',
            'angular-bootstrap-colorpicker/css/colorpicker.css'
        ],
        destination: 'angular-bootstrap-colorpicker'
    },
    angularjs_bootstrap_datetimepicker_css: {
        source: 'angularjs-bootstrap-datetimepicker/src/css/datetimepicker.css',
        destination: 'angularjs-bootstrap-datetimepicker/css'
    },
    angularjs_bootstrap_datetimepicker_js: {
        source: [
            'angularjs-bootstrap-datetimepicker/src/js/datetimepicker.js',
            'angularjs-bootstrap-datetimepicker/src/js/datetimepicker.templates.js'
        ],
        destination: 'angularjs-bootstrap-datetimepicker/js'
    },
    angularjs_bootstrap_datetimepicker_templates: {
        source: 'angularjs-bootstrap-datetimepicker/src/templates/datetimepicker.html',
        destination: 'angularjs-bootstrap-datetimepicker/html'
    },
    //we are using a customized version of this
    //angular_sanitize: {
    //    source: 'angular-sanitize/angular-sanitize.js',
    //    destination: 'angular-sanitize'
    //},
    angular_touch: {
        source: 'angular-touch/angular-touch.js',
        destination: 'angular-touch'
    },
    // we are using a customized version of this
    //angular_wysiwyg: {
    //    source: 'angular-wysiwyg/dist/angular-wysiwyg.js',
    //    destination: 'angular-wysiwyg'
    //},
    angularjs_toaster: {
        source: [
            'angularjs-toaster/toaster.js',
            'angularjs-toaster/toaster.css'
        ],
        destination: 'angularjs-toaster'
    },
    bootstrap: {
        source: [
            'bootstrap/dist/css/bootstrap.css',
            'bootstrap/dist/js/bootstrap.bundle.js',
            'bootstrap/scss/_functions.scss',
            'bootstrap/scss/_variables.scss',
            'bootstrap/scss/mixins/_breakpoints.scss'
        ],
        destination: 'bootstrap'
    },
    bootstrap_social: {
        source: 'bootstrap-social/bootstrap-social.css',
        destination: 'bootstrap-social'
    },
    bowser: {
        source: 'bowser/bundled.js',
        destination: 'bowser'
    },
    font_awesome: {
        source: 'font-awesome/css/font-awesome.css',
        destination: 'font-awesome'
    },
    fonts: {
        source: [
            'font-awesome/fonts/fontawesome-webfont.eot',
            'font-awesome/fonts/fontawesome-webfont.svg',
            'font-awesome/fonts/fontawesome-webfont.ttf',
            'font-awesome/fonts/fontawesome-webfont.woff',
            'font-awesome/fonts/fontawesome-webfont.woff2'
        ],
        destination: 'fonts'
    },
    fullcalendar_core: {
        source: [
            '@fullcalendar/core/main.js',
            '@fullcalendar/core/main.css'
        ],
        destination: '@fullcalendar/core'
    },
    fullcalendar_daygrid: {
        source: [
            '@fullcalendar/daygrid/main.js',
            '@fullcalendar/daygrid/main.css'
        ],
        destination: '@fullcalendar/daygrid'
    },
    fullcalendar_interaction: {
        source: '@fullcalendar/interaction/main.js',
        destination: '@fullcalendar/interaction'
    },
    fullcalendar_timegrid: {
        source: [
            '@fullcalendar/timegrid/main.js',
            '@fullcalendar/timegrid/main.css'
        ],
        destination: '@fullcalendar/timegrid'
    },
    hammerjs: {
        source: 'hammerjs/hammer.js',
        destination: 'hammerjs'
    },
    local_storage: {
        source: 'angular-local-storage/dist/angular-local-storage.js',
        destination: 'angular-local-storage'
    },
    moment_js: {
        source: 'moment/moment.js',
        destination: 'moment'
    },
    ng_file_upload: {
        source: 'ng-file-upload/ng-file-upload.js',
        destination: 'ng-file-upload'
    },
    ng_map: {
        source: 'ngmap/build/scripts/ng-map.js',
        destination: 'ngmap'
    },
    ui_bootstrp4: {
        source: [
            'ui-bootstrap4/dist/ui-bootstrap.js',
            'ui-bootstrap4/dist/ui-bootstrap-csp.css',
            'ui-bootstrap4/dist/ui-bootstrap-tpls.js'
        ],
        destination: 'ui-bootstrap4'
    },
    ui_router: {
        source: 'angular-ui-router/release/angular-ui-router.js',
        destination: 'angular-ui-router'
    },
    videogular: {
        source: [
            'videogular/dist/videogular/videogular.js'
        ],
        destination: 'videogular'
    }
};

// CLEAN //
var dirsToClean = [
    paths.lib,
    paths.baseDest
];

function clean() {
    return del(dirsToClean);
}

gulp.task('clean', clean);

// COPY //
gulp.task('copy', copyNodeLibs);

function copyNodeLibs() {
    var streams = [];
    var pckg = null;
    Object.keys(nodeLibs).forEach(function (key) {
        pckg = nodeLibs[key];
        if (Array.isArray(pckg.source)) {
            for (var i = 0; i < pckg.source.length; i++) {
                pckg.source[i] = paths.node + pckg.source[i];
            }
        }
        else {
            pckg.source = paths.node + pckg.source;
        }
        streams.push(copy(pckg.source, paths.lib + pckg.destination));
    });
    return merge(streams);
}

function copy(source, destination) {
    return gulp.src(source)
        .pipe(gulp.dest(destination));
}

// STYLES //
gulp.task('compile-custom-bootstrap', function () {
    return gulp.src(paths.baseSrc + 'custom/bootstrap/scss/bootstrap.scss')
        .pipe(sass())
        .pipe(rename(function (path) {
            path.extname = ".css";
        }))
        .pipe(gulp.dest(paths.baseSrc + 'custom/bootstrap/dist/css/'));
});

gulp.task('styles', gulp.series('compile-custom-bootstrap'), function () {

    return gulp.src(paths.baseSrc + '**/*.css')
        .pipe(gulp.dest(paths.baseDest));
});

gulp.task('scss-to-css', function () {

    return gulp.src([
        paths.baseSrc + '**/*.scss',
        '!' + paths.baseSrc + '**/_*.scss)'])
        .pipe(sass())
        .pipe(rename(function (path) {
            path.extname = ".css";
        }))
        .pipe(gulp.dest(paths.baseSrc));
});

// FONTS //
gulp.task('fonts', function () {
    return gulp.src(paths.baseSrc + 'fonts/**/*')
        .pipe(gulp.dest(paths.baseDest + 'fonts/'));
});

// IMAGES //
gulp.task('images', function () {
    return gulp.src(paths.baseSrc + 'images/**/*')
        .pipe(gulp.dest(paths.baseDest + 'images/'));
});

// scripts //
gulp.task('scripts', function () {
    return gulp.src(paths.baseSrc + '**/*.js')
        .pipe(gulp.dest(paths.baseDest));
});

// html //
gulp.task('html', function () {
    return gulp.src(paths.baseSrc + '**/*.html')
        .pipe(gulp.dest(paths.baseDest));
});

// BUILD //
gulp.task('build', gulp.series('clean', 'copy', gulp.parallel('fonts', 'images', 'scripts', 'html', 'styles')), function (done) {
    done();
});

// WATCH TASKS //
gulp.task('watch-scripts', function (done) {
    watch([paths.baseSrc + '**/*.js', _notLib], gulp.series('scripts'));
    done();

});

gulp.task('watch-styles', function (done) {
    watch([paths.baseSrc + '**/*.scss', _notLib], gulp.series('scss-to-css'));
    done();
});

gulp.task('watch-html', function (done) {
    watch([paths.baseSrc + '**/*.html', _notLib], gulp.series('html'));
    done();
});

gulp.task('watch', gulp.parallel('watch-scripts', 'watch-styles', 'watch-html'), function (done) {
    done();
});