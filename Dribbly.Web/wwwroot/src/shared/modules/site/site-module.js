(function () {
    'use strict';

    var module = angular.module('siteModule', [
        'ui.router',
        'ngSanitize',
        'ngAnimate',
        'toaster',
        'ngTouch',
        'ui.bootstrap'
    ]);

    module.constant('constants', {
        site: {
            name: 'Dribbly'
        }
    });
})();
