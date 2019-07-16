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

    controllerFunc.$inject = ['authService'];
    function controllerFunc(authService) {
        var dmc = this;

        dmc.$onInit = function () {
            dmc.app.showNavBar();
            dmc.app.showMobileToolbar();
        };

        dmc.isAuthenticated = function () {
            return authService.authentication.isAuthenticated;
        };
    }
})();
