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
        'thatisuday.ng-image-gallery'
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
    }]);

    module.run(['authService', '$transitions', '$rootScope', 'drbblyToolbarService', 'constants', runFn]);
    function runFn(authService, $transitions, $rootScope, drbblyToolbarService, constants) {
        authService.fillAuthData();
        $rootScope.$root.auth = authService.authentication;
        $rootScope.$root.constants = constants;

        $transitions.onSuccess({}, function (trans) {
            drbblyToolbarService.reset();
        });
    }
})();
