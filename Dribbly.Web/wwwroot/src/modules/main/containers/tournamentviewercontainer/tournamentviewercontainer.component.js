(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyTournamentviewercontainer', {
            bindings: {
                app: '<'
            },
            controllerAs: 'lvc',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['drbblyTournamentsService', 'authService', '$stateParams', '$state', 'drbblyOverlayService',
        'constants', 'drbblyDatetimeService'];
    function controllerFunc(drbblyTournamentsService, authService, $stateParams, $state, drbblyOverlayService,
        constants, drbblyDatetimeService) {
        var lvc = this;
        var _tournamentId;

        lvc.$onInit = function () {
            lvc.overlay = drbblyOverlayService.buildOverlay();
            _tournamentId = $stateParams.id;
            loadTournament();
        };

        function loadTournament() {
            lvc.overlay.setToBusy();
            drbblyTournamentsService.getTournamentviewer(_tournamentId)
                .then(function (tournament) {
                    lvc.overlay.setToReady();
                    massageTournament(tournament);
                    lvc.tournament = tournament;
                    lvc.isOwned = authService.isCurrentUserId(lvc.tournament.addedById);
                    lvc.app.mainDataLoaded();
                    lvc.shouldDisplayAsPublic = true; //TODO should be conditional
                    buildSubPages();
                })
                .catch(lvc.overlay.setToError);
        }

        function massageTournament(tournament) {
            tournament.games.forEach(g => g.start = new Date(drbblyDatetimeService.toUtcString(g.start)));
        }

        lvc.onTournamentUpdate = function () {
            loadTournament();
        };

        lvc.$onDestroy = function () {
            lvc.app.toolbar.clearNavItems();
        };

        function buildSubPages() {
            lvc.app.toolbar.setNavItems([
                {
                    textKey: 'app.Games',
                    targetStateName: 'main.tournament.games',
                    targetStateParams: { id: _tournamentId },
                    action: function () {
                        $state.go(this.targetStateName, this.targetStateParams);
                    }
                }
            ]);
        }
    }
})();
