(function () {
    'use strict';

    angular
        .module('authModule')
        .component('drbblyLoginContainer', {
            bindings: {
                app: '<'
            },
            controllerAs: 'dlc',
            templateUrl: '/modules/auth/components/login/login-container/login-container-template.html',
            controller: controllerFunc
        });

    controllerFunc.$inject = [];
    function controllerFunc() {
        var dlc = this;

        dlc.$onInit = function () {
            dlc.app.hideNavBar();
            dlc.app.hideMobileToolbar();
        };
    }
})();
