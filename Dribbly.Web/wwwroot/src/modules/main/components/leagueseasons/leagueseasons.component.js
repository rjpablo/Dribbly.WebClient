(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyLeagueseasons', {
            bindings: {
                app: '<',
                league: '<'
            },
            controllerAs: 'cgc',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['drbblyCourtsService', '$stateParams', '$timeout', 'drbblyCourtshelperService',
        'authService', 'drbblyOverlayService'];
    function controllerFunc(drbblyCourtsService, $stateParams, $timeout, drbblyCourtshelperService,
        authService, drbblyOverlayService) {
        var cgc = this;

        cgc.$onInit = function () {

        };

        cgc.courtFilter = function (item) {
            return item.title.toLowerCase().indexOf((cgc.titleFilter || '').toLowerCase()) > -1;
        };
    }
})();
