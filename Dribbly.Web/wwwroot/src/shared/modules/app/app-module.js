(function () {
    'use strict';

    var module = angular.module('appModule', [
        'wysiwyg.module',
        'ngMap',
        'drrbly.ui.router.title',
        'siteModule',
        'authModule',
        'ngFileUpload',
        'daypilot',
        'thatisuday.ng-image-gallery',
        'com.2fdevs.videogular',
        'com.2fdevs.videogular.plugins.controls',
        'com.2fdevs.videogular.plugins.overlayplay',
        'com.2fdevs.videogular.plugins.buffering',
        'slickCarousel',
        'angular-inview'
    ]);

    module.config(['$titleProvider', 'constants', function ($titleProvider, constants) {
        $titleProvider.documentTitle(function ($rootScope) {
            return $rootScope.$root.$title ? $rootScope.$root.$title + ' - ' + constants.site.name : constants.site.name;
        });
    }]);

    module.run(['authService', '$transitions', '$rootScope', 'drbblyToolbarService', 'constants', '$filter', runFn]);
    function runFn(authService, $transitions, $rootScope, drbblyToolbarService, constants, $filter) {
        authService.refreshToken();
        window.Dribbly.authentication = authService.authentication;
        $rootScope.$root.auth = authService.authentication;
        $rootScope.$root.constants = constants;
        $rootScope.$root.$filter = $filter;

        $transitions.onSuccess({}, function (trans) {
            drbblyToolbarService.reset();
        });
    }
})();
