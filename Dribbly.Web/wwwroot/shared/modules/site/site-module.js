(function () {
    'use strict';

    var module = angular.module('siteModule', [
        'ui.router',
        'ngSanitize',
        'ngAnimate',
        'ngTouch',
        'ui.bootstrap'
    ]);

    module.constant('constants', {
        site: {
            name: 'Dribbly'
        }
    });
})();
