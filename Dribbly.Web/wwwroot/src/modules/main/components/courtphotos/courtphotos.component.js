﻿(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyCourtphotos', {
            bindings: {
                onUpdate: '<'
            },
            controllerAs: 'dcp',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['authService', 'drbblyCourtshelperService', 'drbblyFileService', '$stateParams',
        'drbblyOverlayService', 'drbblyCourtsService'];
    function controllerFunc(authService, drbblyCourtshelperService, drbblyFileService, $stateParams,
        drbblyOverlayService, drbblyCourtsService) {
        var dcp = this;

        dcp.$onInit = function () {

        };
    }
})();
