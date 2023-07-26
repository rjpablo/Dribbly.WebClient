(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyTournamentstages', {
            bindings: {
                app: '<',
                massageStages: '<',
                tournament: '<'
            },
            controllerAs: 'tsc',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['drbblyTournamentsService', 'modalService', 'drbblyCommonService', 'constants',
        'authService', 'drbblyOverlayService', 'drbblyGameshelperService', '$q', '$timeout', 'drbblyDatetimeService'];
    function controllerFunc(drbblyTournamentsService, modalService, drbblyCommonService, constants,
        authService, drbblyOverlayService, drbblyGameshelperService, $q, $timeout, drbblyDatetimeService) {
        var tsc = this;

        tsc.$onInit = function () {
            tsc.overlay = drbblyOverlayService.buildOverlay();
            tsc.stageOverlay = drbblyOverlayService.buildOverlay();
            loadStages();
            tsc.isManager = tsc.tournament.addedById === authService.authentication.accountId;
        };

        function loadStages() {
            tsc.isBusy = true;
            tsc.stageOverlay.setToBusy();
            drbblyTournamentsService.getTournamentStages(tsc.tournament.id)
                .then(function (stages) {
                    tsc.stageOverlay.setToReady();
                    tsc.massageStages(stages);
                    tsc.tournament.stages = stages;
                    if (stages.length > 0) {
                        $timeout(function () {
                            var activeStage = stages.drbblyFirstOrDefault(s => s.status === constants.enums.stageStatusEnum.Started);
                            tsc.activeTabIndex = activeStage ? activeStage.id : stages[0].id;
                        })
                    }
                })
                .catch(error => {
                    drbblyCommonService.handleError(error);
                    tsc.stageOverlay.setToError();
                })
                .finally(() => {
                    tsc.isBusy = false;
                    tsc.stageOverlay.setToReady();
                });
        }

        tsc.canDeleteGame = () => true;
        tsc.canEditGame = () => true;

        tsc.addStage = function () {
            modalService.show({
                view: '<drbbly-addstagemodal></drbbly-addstagemodal>',
                model: {
                    tournament: tsc.tournament
                }
            })
                .then(loadStages)
                .catch(function () { /* do nothing */ })
        };

        tsc.addBracket = function (stage) {
            modalService.input({
                model: {
                    prompt: "Bracket Name:",
                    titleRaw: "Add Bracket",
                    type: 'text',
                    required: true,
                    maxLength: 20
                }
            })
                .then(name => {
                    drbblyTournamentsService.addStageBracket(name, stage.id)
                        .then(bracket => {
                            stage.brackets.push(bracket);
                            tsc.massageStages([stage]);
                        })
                        .catch(drbblyCommonService.handleError);
                })
                .catch(function () { /* cancelled, do nothing */ })
        }

        tsc.deleteStageBracket = function (bracket, stage) {
            modalService.confirm({ msg1Raw: 'Discard ' + bracket.name })
                .then(confirmed => {
                    if (confirmed) {
                        drbblyTournamentsService.deleteStageBracket(bracket.id)
                            .then(() => {
                                bracket.teams.forEach(team => {
                                    team.bracketId = null;
                                });
                                stage.brackets.drbblyRemove(b => b.id === bracket.id);
                                tsc.massageStages([stage]);
                            })
                            .catch(drbblyCommonService.handleError);
                    }
                })
                .catch(function () { /* cancelled, do nothing */ })
        }

        tsc.deleteStage = function (stage) {
            modalService.confirm({ msg1Raw: 'Delete ' + stage.name })
                .then(confirmed => {
                    if (confirmed) {
                        drbblyTournamentsService.deleteStage(stage.id)
                            .then(() => {
                                tsc.tournament.games.drbblyRemove(g => g.stageId === stage.id);
                                tsc.tournament.stages.drbblyRemove(s => s.id == stage.id);
                            })
                            .catch(drbblyCommonService.handleError);
                    }
                })
                .catch(function () { /* cancelled, do nothing */ })
        }

        tsc.onGameDeleted = function (game) {
            tsc.tournament.games.drbblyRemove(g => g.id === game.id);
        }

        tsc.renameStage = function (stage) {
            modalService.input({
                model: {
                    prompt: "New Stage Name:",
                    titleRaw: "Rename Stage",
                    type: 'text',
                    required: true,
                    maxLength: 20,
                    value: stage.name
                }
            })
                .then(name => {
                    drbblyTournamentsService.renameStage(stage.id, name)
                        .then(() => {
                            stage.name = name;
                        })
                        .catch(drbblyCommonService.handleError);
                })
                .catch(function () { /* cancelled, do nothing */ })
        }

        tsc.onTeamDrop = function (event, ui, bracket, stage) {
            var teamId = Number(ui.draggable.attr('data-teamid'));
            var newTeam = stage.teams.drbblySingle(t => t.teamId === teamId);
            tsc.setTeamBracket(newTeam, stage, bracket.id);
        };

        tsc.setTeamBracket = function (team, stage, bracketId) {
            drbblyTournamentsService.setTeamBracket(team.teamId, stage.id, bracketId)
                .then(() => {
                    team.bracketId = bracketId;
                    tsc.massageStages([stage])
                })
                .catch(error => drbblyCommonService.handleError(error));
        }

        tsc.editTeams = function (stage) {
            modalService.show({
                view: '<drbbly-teamselectionmodal></drbbly-teamselectionmodal>',
                model: {
                    stage: stage,
                    title: 'Select teams participating in ' + stage.name,
                    teams: tsc.tournament.teams.map(t => {
                        return { id: t.teamId, name: t.team.name, logo: t.team.logo };
                    }),
                    isSelectedCallback: team => {
                        return (stage.teams || []).drbblyAny(t => t.teamId === team.id)
                    },
                    onSubmitCallback: data => onSetTeamsSubmitted(data, stage)
                }
            })
                .catch(function () { /* do nothing */ })
        };

        function onSetTeamsSubmitted(data, stage) {
            var input = {
                stageId: stage.id,
                teamIds: data.selectedTeams.map(t => t.id)
            };

            return drbblyTournamentsService.setStageTeams(input)
                .then(function (result) {
                    stage.teams = result.teams;
                    tsc.massageStages([stage]);
                })
                .catch(function (e) {
                    drbblyCommonService.handleError(e);
                    throw e;
                });
        }

        tsc.addGame = function (stage) {
            drbblyGameshelperService.openAddEditGameModal({
                tournament: tsc.tournament,
                stage: stage,
                teamTypeAheadConfig: {
                    onGetSuggestions: keyword => {
                        var suggestions = stage.teams.drbblyWhere(t => t.team.name.toLowerCase().indexOf(keyword.toLowerCase()) > -1)
                            .map(t => {
                                return {
                                    value: t.teamId,
                                    text: t.team.name,
                                    iconUrl: t.team.logo ? t.team.logo.url : constants.images.defaultTeamLogoUrl
                                };
                            });
                        return $q.resolve(suggestions);
                    }
                }
            })
                .then(function (game) {
                    game.start = new Date(drbblyDatetimeService.toUtcString(game.start));
                    tsc.tournament.games.push(game);
                    stage.games.push(game);
                })
                .catch(function () { /* do nothing */ })
        }

        tsc.canDeleteItem = function (stage) {
            return tsc.tournament.addedById === authService.authentication.userId;
        }

        tsc.canEditItem = function (stage) {
            return tsc.tournament.addedById === authService.authentication.userId;
        }
    }
})();
