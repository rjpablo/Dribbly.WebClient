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
            dtg.hasStages = dtg.tournament.stages && dtg.tournament.stages.length > 0;
            dtg.filter = {};
            dtg.isManager = authService.isCurrentUserId(dtg.tournament.addedById);
            if (dtg.hasStages) {
                dtg.ddlStageChoices = dtg.tournament.stages.map(s => {
                    return { text: s.name, value: s.id };
                });
                dtg.ddlStageChoices.unshift({ text: 'All', value: null });
            }

            $timeout(() => {
                dtg.filter.stageId = null;
            });
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

        dtg.gamesFilter = function (game, index, games) {
            return !dtg.hasStages || !dtg.filter.stageId || game.stageId === dtg.filter.stageId;
        }

        dtg.canDeleteItem = function (game) {
            return dtg.tournament.addedById === authService.authentication.userId;
        }

        dtg.canEditItem = function (game) {
            return dtg.tournament.addedById === authService.authentication.userId;
        }
    }
})();
