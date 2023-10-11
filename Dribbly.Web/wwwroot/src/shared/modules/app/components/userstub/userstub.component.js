(function () {
    'use strict';

    angular.module('appModule')
        .component('drbblyUserstub', {
            bindings: {
                user: '<'
            },
            controllerAs: 'dus',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = [];
    function controllerFn() {
        var dus = this;

        dus.$onInit = function () {

        };
    }
})();
