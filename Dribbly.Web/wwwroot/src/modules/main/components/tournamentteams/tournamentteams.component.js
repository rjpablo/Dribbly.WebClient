(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyTournamentteams', {
            bindings: {
                app: '<',
                tournament: '<'
            },
            controllerAs: 'dtg',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['drbblyTeamshelperService', '$stateParams', '$timeout', 'drbblyCourtshelperService',
        'authService', 'drbblyOverlayService'];
    function controllerFunc(drbblyTeamshelperService, $stateParams, $timeout, drbblyCourtshelperService,
        authService, drbblyOverlayService) {
        var dtg = this;

        dtg.$onInit = function () {

        };

        dtg.canDeleteItem = function (team) {
            return dtg.tournament.addedById === authService.authentication.userId;
        }

        dtg.canEditItem = function (team) {
            return dtg.tournament.addedById === authService.authentication.userId;
        }
    }
})();
