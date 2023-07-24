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
        'constants', 'drbblyDatetimeService', 'drbblyTeamsService', 'drbblyCommonService', 'modalService'];
    function controllerFunc(drbblyTournamentsService, authService, $stateParams, $state, drbblyOverlayService,
        constants, drbblyDatetimeService, drbblyTeamsService, drbblyCommonService, modalService) {
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
                    lvc.isManager = lvc.isOwned;
                    lvc.app.mainDataLoaded();
                    lvc.shouldDisplayAsPublic = true; //TODO should be conditional
                    buildSubPages();
                })
                .catch(lvc.overlay.setToError);
        }

        lvc.onJoinClicked = async function () {
            lvc.isBusy = true;
            var managedTeams = await drbblyTeamsService.getManagedTeamsAsChoices()
                .catch(e => drbblyCommonService.handleError(e))
                .finally(() => lvc.isBusy = false);
            if (managedTeams && managedTeams.length > 0) {
                modalService.show({
                    view: '<drbbly-jointournamentmodal></drbbly-jointournamentmodal>',
                    model: {
                        teamChoices: managedTeams,
                        tournament: lvc.tournament
                    }
                })
            }
            else if (managedTeams && managedTeams.length === 0) {
                modalService.error({
                    msg1Raw: 'You do not manage any team that is eligible to sign up for this tournament. You must manage at least one eligible team to sign up.'
                })
            }
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
                },
                {
                    textKey: 'app.Teams',
                    targetStateName: 'main.tournament.teams',
                    targetStateParams: { id: _tournamentId },
                    action: function () {
                        $state.go(this.targetStateName, this.targetStateParams);
                    }
                },
                {
                    textKey: 'app.Stages',
                    targetStateName: 'main.tournament.stages',
                    targetStateParams: { id: _tournamentId },
                    action: function () {
                        $state.go(this.targetStateName, this.targetStateParams);
                    },
                    isRemoved: !lvc.isManager
                }
            ]);
        }
    }
})();
