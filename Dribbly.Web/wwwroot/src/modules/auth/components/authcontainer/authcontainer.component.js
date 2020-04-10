(function () {
    'use strict';

    angular
        .module('authModule')
        .component('drbblyAuthcontainer', {
            bindings: {
                app: '<'
            },
            controllerAs: 'dac',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = [];
    function controllerFunc() {
        var dac = this;

        dac.$onInit = function () {

        };
    }
})();
