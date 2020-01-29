(function () {
    'use strict';

    angular.module('mainModule')
        .component('drbblyCourtpreviewmodal', {
            bindings: {
                model: '<',
                context: '<',
                options: '<'
            },
            controllerAs: 'cpm',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['drbblyCourtsService', 'modalService'];
    function controllerFn(drbblyCourtsService, modalService) {
        var cpm = this;

        cpm.$onInit = function () {

        };
    }
})();
