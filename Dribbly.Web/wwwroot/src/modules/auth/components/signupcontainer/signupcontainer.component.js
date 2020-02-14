(function () {
    'use strict';

    angular
        .module('authModule')
        .component('drbblySignupcontainer', {
            bindings: {
                app: '<'
            },
            controllerAs: 'sup',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = [];
    function controllerFunc() {
        var sup = this;

        sup.$onInit = function () {

        };
    }
})();
