(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyMainContainer', {
            bindings: {
                app: '<'
            },
            controllerAs: 'dmc',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['authService', '$rootScope', 'settingsService', '$window'];
    function controllerFunc(authService, $rootScope, settingsService, $window) {
        var dmc = this;

        dmc.$onInit = function () {
            dmc.app.showNavBar();
            dmc.app.showMobileToolbar();
            dmc.isUsingSideNavigator = settingsService.useSideNavigator;

            $rootScope.$on('toggle-sidenavigator', (expand) => {
                dmc.sideNavigator.toggle(expand);
            });

            angular.element($window).on('resize', dmc.app.onSectionResize);
        };

        dmc.$onDestroy = function () {
            angular.element($window).off('resize', dmc.app.onSectionResize);
        };

        dmc.isAuthenticated = function () {
            return authService.authentication.isAuthenticated;
        };
    }
})();
