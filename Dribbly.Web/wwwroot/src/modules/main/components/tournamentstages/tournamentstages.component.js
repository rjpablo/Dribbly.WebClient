﻿(function () {
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
        'authService', 'drbblyOverlayService', 'drbblyGameshelperService', '$q', '$timeout'];
    function controllerFunc(drbblyTournamentsService, modalService, drbblyCommonService, constants,
        authService, drbblyOverlayService, drbblyGameshelperService, $q, $timeout) {
        var tsc = this;

        tsc.$onInit = function () {
            tsc.overlay = drbblyOverlayService.buildOverlay();
            tsc.stageOverlay = drbblyOverlayService.buildOverlay();
            loadStages();
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
