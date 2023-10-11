(function () {
    'use strict';

    /** @module appModule */
    var module = angular.module('appModule', [
        'wysiwyg.module',
        'ngMap',
        'siteModule',
        'authModule',
        'ngFileUpload',
        'daypilot',
        'thatisuday.ng-image-gallery',
        'slickCarousel',
        'angular-inview',
        'ngDragDrop'
    ]);

    module.run(['authService', '$transitions', '$rootScope', 'drbblyToolbarService', 'constants', '$filter',
        'drbblyGameshelperService',
        async function runFn(authService, $transitions, $rootScope, drbblyToolbarService, constants, $filter,
            drbblyGameshelperService) {            
            $rootScope.$root.constants = constants;
            $rootScope.$root.$filter = $filter;
            await authService.verifyToken();
            $rootScope.$root.auth = authService.authentication;
            drbblyGameshelperService.initializeGameHub();

            $transitions.onSuccess({}, function (trans) {
                drbblyToolbarService.reset();
            });
        }
    ]);
})();
