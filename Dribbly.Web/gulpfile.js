/// <binding BeforeBuild='build' />
const gulp = require('gulp');
const merge = require("merge-stream");
const del = require("del");

var paths = {
    node: './node_modules/',
    lib: './wwwroot/lib/'
};

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
    angular_sanitize: {
        source: 'angular-sanitize/angular-sanitize.js',
        destination: 'angular-sanitize'
    },
    angular_touch: {
        source: 'angular-touch/angular-touch.js',
        destination: 'angular-touch'
    },
    angular_ui_bootstrap: {
        source: 'angular-ui-bootstrap/dist/ui-bootstrap-tpls.js',
        destination: 'angular-ui-bootstrap'
    },
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
    local_storage: {
        source: 'angular-local-storage/dist/angular-local-storage.js',
        destination: 'angular-local-storage'
    },
    ng_map: {
        source: 'ngmap/build/scripts/ng-map.js',
        destination: 'ngmap'
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