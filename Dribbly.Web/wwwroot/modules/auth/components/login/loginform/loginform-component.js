(function () {
    'use strict';

    angular
        .module('authModule')
        .component('drbblyLoginform', {
            bindings: {},
            controllerAs: 'dhc',
            templateUrl: '/modules/auth/components/login/loginform/loginform-template.html',
            controller: controllerFunc
        });

    controllerFunc.$inject = [];
    function controllerFunc() {
        var dhc = this;
    }
})();
