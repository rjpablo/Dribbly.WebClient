(function () {
    'use strict';

    angular
        .module('authModule')
        .component('drbblySignupContainer', {
            bindings: {
                app: '<'
            },
            controllerAs: 'sup',
            templateUrl: '/modules/auth/components/signup/signup-container/signup-container-template.html',
            controller: controllerFunc
        });

    controllerFunc.$inject = [];
    function controllerFunc() {
        var sup = this;

        sup.$onInit = function () {
            sup.app.hideNavBar();
            sup.app.hideMobileToolbar();
        };
    }
})();
