(function () {
    'use strict';

    angular
        .module('authModule')
        .component('drbblySocialauth', {
            bindings: {},
            controllerAs: 'dsa',
            templateUrl: '/modules/auth/components/shared/socialauth/socialauth-template.html',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['authService'];
    function controllerFunc(authService) {
        var dsa = this;

        dsa.$onInit = function () {
        };

        dsa.loginExternal = function (provider) {
            authService.loginExternal(provider);
        };
    }
})();
