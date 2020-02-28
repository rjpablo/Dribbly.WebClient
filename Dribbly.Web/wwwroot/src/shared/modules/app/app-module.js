(function () {
    'use strict';

    var module = angular.module('appModule', [
        'wysiwyg.module',
        'ngMap',
        'drrbly.ui.router.title',
        'siteModule',
        'authModule',
        'ngFileUpload',
        'daypilot'
    ]);

    module.config(['$titleProvider', 'constants', function ($titleProvider, constants) {
        $titleProvider.documentTitle(function ($rootScope) {
            return $rootScope.$root.$title ? $rootScope.$root.$title + ' - ' + constants.site.name : constants.site.name;
        });
    }]);

    module.run(['authService', '$transitions', '$rootScope', 'drbblyToolbarService', runFn]);
    function runFn(authService, $transitions, $rootScope, drbblyToolbarService) {
        authService.fillAuthData();
        $rootScope.$root.auth = authService.authentication;

        $transitions.onSuccess({}, function (trans) {
            drbblyToolbarService.reset();
        });
    }

    module.config(['constants', function (constants) {
        constants.settings = {
            googleMapApiKey: 'googleMapApiKey'
        };
    }]);
})();
