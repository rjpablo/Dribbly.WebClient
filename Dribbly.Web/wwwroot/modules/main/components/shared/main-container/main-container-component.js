(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyMainContainer', {
            bindings: {
                app: '<'
            },
            controllerAs: 'dmc',
            templateUrl: '/modules/main/components/shared/main-container/main-container-template.html',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['authService', '$rootScope', 'settingsService'];
    function controllerFunc(authService, $rootScope, settingsService) {
        var dmc = this;

        dmc.$onInit = function () {
            dmc.app.showNavBar();
            dmc.app.showMobileToolbar();
            dmc.isUsingSideNavigator = settingsService.useSideNavigator;

            $rootScope.$on('toggle-sidenavigator', (expand) => {
                dmc.sideNavigator.toggle(expand);
            });
        };

        dmc.isAuthenticated = function () {
            return authService.authentication.isAuthenticated;
        };
    }
})();
