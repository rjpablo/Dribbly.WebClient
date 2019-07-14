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

    controllerFunc.$inject = [];
    function controllerFunc() {
        var dsa = this;

        dsa.$onInit = function () {
        };

        dsa.loginExternal = function (type) {
            alert('log in with ' + type + ' - Not yet implemented.');
        };
    }
})();
