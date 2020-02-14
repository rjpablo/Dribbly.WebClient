(function () {
    'use strict';

    angular
        .module('authModule')
        .component('drbblySocialauth', {
            bindings: {},
            controllerAs: 'dsa',
            templateUrl: 'drbbly-default',
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
