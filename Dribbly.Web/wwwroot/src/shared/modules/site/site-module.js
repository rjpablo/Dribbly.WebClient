(function () {
    'use strict';

    var module = angular.module('siteModule', [
        'ui.router',
        'ngSanitize',
        'ngAnimate',
        'toaster',
        'ngTouch',
        'ui.bootstrap',
        'ui.bootstrap.datetimepicker'
    ]);

    module.constant('constants', {
        site: {
            name: 'Dribbly'
        }
    });
})();
