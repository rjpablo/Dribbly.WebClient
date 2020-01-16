﻿(function () {
    'use strict';

    var module = angular.module('appModule', [
        'drrbly.ui.router.title',
        'siteModule',
        'authModule'
    ]);

    module.config(['$titleProvider', 'constants', function ($titleProvider, constants) {
        $titleProvider.documentTitle(function ($rootScope) {
            return $rootScope.$root.$title ? $rootScope.$root.$title + ' - ' + constants.site.name : constants.site.name;
        });
    }]);

    module.run(['authService', '$transitions', '$rootScope', 'drbblyToolbarService', runFn]);
    function runFn(authService, $transitions, $rootScope, drbblyToolbarService) {
        authService.fillAuthData();
        $rootScope.$root = {
            auth: authService.authentication
        };

        $transitions.onSuccess({}, function (trans) {
            drbblyToolbarService.reset();
        });
    }
})();
