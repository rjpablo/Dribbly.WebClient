(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyTournamentgames', {
            bindings: {
                app: '<',
                tournament: '<'
            },
            controllerAs: 'dtg',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['drbblyGameshelperService', '$stateParams', '$timeout', 'drbblyCourtshelperService',
        'authService', 'drbblyOverlayService'];
    function controllerFunc(drbblyGameshelperService, $stateParams, $timeout, drbblyCourtshelperService,
        authService, drbblyOverlayService) {
        var dtg = this;

        dtg.$onInit = function () {

        };

        dtg.addGame = function () {
            drbblyGameshelperService.openAddEditGameModal({
                tournamentId: dtg.tournament.id,
                court: dtg.tournament.defaultCourt
            })
                .then(function (game) {
                    dtg.tournament.games.push(game);
                })
                .catch(function () { /* do nothing */ })
        };

        dtg.canDeleteItem = function (game) {
            return dtg.tournament.addedById === authService.authentication.userId;
        }

        dtg.canEditItem = function (game) {
            return dtg.tournament.addedById === authService.authentication.userId;
        }
    }
})();
