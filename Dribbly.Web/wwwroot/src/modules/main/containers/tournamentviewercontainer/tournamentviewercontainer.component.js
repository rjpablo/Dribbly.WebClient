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
        'constants', 'drbblyDatetimeService', 'drbblyTeamsService', 'drbblyCommonService', 'modalService',
        'drbblyFileService'];
    function controllerFunc(drbblyTournamentsService, authService, $stateParams, $state, drbblyOverlayService,
        constants, drbblyDatetimeService, drbblyTeamsService, drbblyCommonService, modalService,
        drbblyFileService) {
        var lvc = this;
        var _tournamentId;

        lvc.$onInit = function () {
            lvc.overlay = drbblyOverlayService.buildOverlay();
            lvc.logoOverlay = drbblyOverlayService.buildOverlay();
            _tournamentId = $stateParams.id;
            loadTournament()
                .then(buildSubPages);
        };

        // #region Logo Operations
        lvc.onLogoClicked = function () {
            if (lvc.tournament.logo.isDefault && !lvc.isManager) {
                viewLogo();
                return;
            }

            modalService.showMenuModal({
                model: {
                    buttons: [
                        {
                            text: 'View Logo',
                            action: viewLogo,
                            class: 'btn-secondary'
                        },
                        {
                            text: 'ReplaceLogo',
                            action: function () {
                                angular.element('#btn-replace-photo').triggerHandler('click');
                            },
                            isHidden: () => !lvc.isManager,
                            class: 'btn-secondary'
                        }
                    ],
                    hideHeader: true
                },
                size: 'sm',
                backdrop: true
            })
        };

        function viewLogo() {
            lvc.photos = [lvc.tournament.logo];
            lvc.methods.open(0);
        }

        lvc.onLogoSelect = function (file) {
            if (!file) { return; }

            lvc.logoOverlay.setToBusy('');

            var url = URL.createObjectURL(file);
            return modalService.show({
                view: '<drbbly-croppermodal></drbbly-croppermodal>',
                model: {
                    imageUrl: url,
                    cropperOptions: {
                        aspectRatio: 1
                    }
                }
            })
                .then(function (imageData) {
                    var fileNameNoExt = (file.name.split('\\').pop().split('/').pop().split('.'))[0]
                    imageData.name = fileNameNoExt + '.png';
                    return drbblyFileService.upload(imageData, 'api/tournaments/updateLogo/' + lvc.tournament.id)
                        .then(function (result) {
                            if (result && result.data) {
                                lvc.tournament.logo = result.data;
                                lvc.tournament.logoId = result.data.id;
                            }
                        })
                        .catch(function (error) {
                            drbblyCommonService.handleError(error);
                        });
                })
                .finally(function () {
                    URL.revokeObjectURL(url)
                    lvc.logoOverlay.setToReady();
                });
        };
        // #endregion Logo Operations

        function loadTournament() {
            lvc.overlay.setToBusy();
            return drbblyTournamentsService.getTournamentviewer(_tournamentId)
                .then(function (tournament) {
                    lvc.overlay.setToReady();
                    lvc.tournament = tournament;
                    massageTournament(lvc.tournament);
                    lvc.isOwned = authService.isCurrentUserId(lvc.tournament.addedById);
                    lvc.isManager = lvc.isOwned;
                    lvc.app.mainDataLoaded();
                    lvc.shouldDisplayAsPublic = true; //TODO should be conditional
                })
                .catch(() => lvc.overlay.setToError());
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
            lvc.massageStages(tournament.stages);
            if (!tournament.logo) {
                tournament.logo = constants.images.defaultTournamentLogo;
            }
        }

        lvc.massageStages = function (stages) {
            stages.forEach(s => {
                s.games = lvc.tournament.games.drbblyWhere(g => g.stageId === s.id);
                s.brackets.forEach(b => {
                    b.teams = s.teams.drbblyWhere(t => t.bracketId == b.id);
                })
                var defaultBracket = s.brackets.drbblySingleOrDefault(b => b.id === null);
                if (defaultBracket) {
                    defaultBracket.teams = s.teams.drbblyWhere(t => t.bracketId === null);
                }
                else {
                    s.brackets.unshift({
                        id: null,
                        isDefault: true,
                        name: 'Not Assigned',
                        teams: s.teams.drbblyWhere(t => t.bracketId === null)
                    })
                }
            })
        }

        lvc.onTournamentUpdate = function () {
            return loadTournament();
        };

        lvc.$onDestroy = function () {
            lvc.app.toolbar.clearNavItems();
        };

        function buildSubPages() {
            lvc.app.toolbar.setNavItems([
                {
                    textKey: 'app.Teams',
                    targetStateName: 'main.tournament.teams',
                    targetStateParams: { id: _tournamentId },
                    action: function () {
                        $state.go(this.targetStateName, this.targetStateParams);
                    }
                },
                {
                    textKey: 'app.Games',
                    targetStateName: 'main.tournament.games',
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
                },
                {
                    textKey: 'app.Settings',
                    targetStateName: 'main.tournament.settings',
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
