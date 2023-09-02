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
        'authService', 'drbblyOverlayService', '$filter'];
    function controllerFunc(drbblyGameshelperService, $stateParams, $timeout, drbblyCourtshelperService,
        authService, drbblyOverlayService, $filter) {
        var dtg = this;

        dtg.$onInit = function () {
            dtg.hasStages = dtg.tournament.stages && dtg.tournament.stages.length > 0;
            dtg.filter = {};
            dtg.isManager = dtg.tournament.addedById === authService.authentication.accountId;
            if (dtg.hasStages) {
                dtg.ddlStageChoices = dtg.tournament.stages.map(s => {
                    return { text: s.name, value: s.id };
                });
                dtg.ddlStageChoices.unshift({ text: 'All Stages', value: null });
            }
            setGameDates();

            $timeout(() => {
                dtg.filter.stageId = null;
            });
            dtg.app.updatePageDetails({
                title: (dtg.tournament.name) + ' - Games',
                image: dtg.tournament.logo.url
            });
        };

        function setGameDates() {
            dtg.gameDates = [];
            dtg.tournament.games.forEach(game => {
                var date = $filter('date')(game.start, 'yyyyMMdd');
                var gameDate = dtg.gameDates.drbblySingleOrDefault(d => d.date === date);
                if (gameDate) {
                    gameDate.gameCount++;
                    gameDate.games.push(game);
                    gameDate.label = $filter('date')(game.start, 'MMM-dd-yyyy') + ` (${gameDate.gameCount} games)`;
                }
                else {
                    dtg.gameDates.push({
                        date: date,
                        gameCount: 1,
                        label: $filter('date')(game.start, 'MMM-dd-yyyy') + ` (1 game)`,
                        month: $filter('date')(game.start, 'MMM'),
                        day: $filter('date')(game.start, 'dd'),
                        games: [game]
                    });
                }
            });
            dtg.gameDates = dtg.gameDates.sort((a, b) => a.date > b.date ? 1 : b.date > a.date ? -1 : 0);
            dtg.gameDates.unshift({
                label: `All dates (${dtg.tournament.games.length} game${dtg.tournament.games.length > 1? 's' : ''})`,
                date: '',
                gameCount: dtg.tournament.games.length,
                games: dtg.tournament.games
            });

            $timeout(function () {
                var todayDate = $filter('date')(new Date(), 'yyyyMMdd');
                var defaultDate = dtg.gameDates.drbblyFirstOrDefault(d => d.date === todayDate || d.date > todayDate);
                dtg.selectedDate = defaultDate || dtg.gameDates[dtg.gameDates.length - 1];
            });
        }

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
