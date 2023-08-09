(function () {
    'use strict';

    angular.module('siteModule')
        .component('drbblyCharcount', {
            bindings: {
                length: '<',
                maxLength: '<',
                warningThreshold: '<'
            },
            controllerAs: 'dcc',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = [];
    function controllerFn() {
        var dcc = this;

        dcc.$onInit = function () {
            console.log(dcc.warningThreshold);
        };
    }
})();
