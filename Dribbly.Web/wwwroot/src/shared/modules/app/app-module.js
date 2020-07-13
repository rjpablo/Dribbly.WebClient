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
        'com.2fdevs.videogular.plugins.buffering'
    ]);

    module.config(['$titleProvider', 'constants', function ($titleProvider, constants) {
        $titleProvider.documentTitle(function ($rootScope) {
            return $rootScope.$root.$title ? $rootScope.$root.$title + ' - ' + constants.site.name : constants.site.name;
        });
    }]);

    module.config(['constants', function (constants) {
        constants.settings = {
            googleMapApiKey: 'googleMapApiKey'
        };
        // This should kept in sync with the password validation options in ApplicationUserManager.cs in the API
        constants.PASSWORD_VALIDATION_REGEX = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s).{6,14}$/;
        constants.images = {
            defaultProfilePhotoUrl: 'src/images/default_images/default_profile_photo.jpg'
        };
        constants.coordinates = {
            PHILIPPINES: { lat: 12.8797, lng: 121.7740 },
            MANILA: { lat: 14.5995, lng: 120.9842 }
        };
    }]);

    module.run(['authService', '$transitions', '$rootScope', 'drbblyToolbarService', 'constants', '$filter', runFn]);
    function runFn(authService, $transitions, $rootScope, drbblyToolbarService, constants, $filter) {
        authService.fillAuthData();
        window.Dribbly.authentication = authService.authentication;
        $rootScope.$root.auth = authService.authentication;
        $rootScope.$root.constants = constants;
        $rootScope.$root.$filter = $filter;

        $transitions.onSuccess({}, function (trans) {
            drbblyToolbarService.reset();
        });
    }
})();
