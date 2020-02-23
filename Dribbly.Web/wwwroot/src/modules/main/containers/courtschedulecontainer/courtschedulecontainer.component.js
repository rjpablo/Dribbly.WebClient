(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyCourtschedulecontainer', {
            bindings: {
                app: '<'
            },
            controllerAs: 'csc',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['drbblyCourtsService', '$element', 'drbblyToolbarService', 'drbblyCourtshelperService',
        'drbblyOverlayService', '$timeout', '$state'];
    function controllerFunc(drbblyCourtsService, $element, drbblyToolbarService, drbblyCourtshelperService,
        drbblyOverlayService, $timeout, $state) {
        var csc = this;

        csc.$onInit = function () {

        };
    }
})();
