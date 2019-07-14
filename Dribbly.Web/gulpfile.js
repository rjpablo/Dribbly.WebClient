/// <binding BeforeBuild='copy, build' />
const gulp = require('gulp');
const merge = require("merge-stream");
const del = require("del");

var paths = {
    node: './node_modules/',
    lib: './wwwroot/lib/'
};

var nodeLibs = {
    jquery: {
        source: 'jquery/dist/jquery.js',
        destination: 'jquery'
    },
    angular: {
        source: 'angular/angular.js',
        destination: 'angular'
    },
    bootstrap: {
        source: [
            'bootstrap/dist/css/bootstrap.css',
            'bootstrap/dist/js/bootstrap.bundle.js'
        ],
        destination: 'bootstrap'
    },
    bootstrap_social: {
        source: 'bootstrap-social/bootstrap-social.css',
        destination: 'bootstrap-social'
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
    ui_router: {
        source: 'angular-ui-router/release/angular-ui-router.js',
        destination: 'angular-ui-router'
    }
};

// CLEAN //
var dirsToClean = [
    paths.lib
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

// BUILD //
gulp.task('build', gulp.series('clean', 'copy'), function (done) {
    done();
});