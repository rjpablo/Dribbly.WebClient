(function () {
    'use strict';

    angular
        .module('authModule')
        .component('drbblyLoginContainer', {
            bindings: {},
            controllerAs: 'dhc',
            templateUrl: '/modules/auth/components/login/login-container/login-container-template.html',
            controller: controllerFunc
        });

    controllerFunc.$inject = [];
    function controllerFunc() {
        var dhc = this;
    }
})();
