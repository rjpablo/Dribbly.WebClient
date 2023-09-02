(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyTournamentteams', {
            bindings: {
                app: '<',
                massageStages: '<',
                tournament: '<'
            },
            controllerAs: 'dtg',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['drbblyTournamentsService', 'modalService', '$timeout', 'drbblyCommonService',
        'authService', 'drbblyOverlayService'];
    function controllerFunc(drbblyTournamentsService, modalService, $timeout, drbblyCommonService,
        authService, drbblyOverlayService) {
        var dtg = this;

        dtg.$onInit = function () {
            dtg.isManager = dtg.tournament.addedById === authService.authentication.accountId;
            dtg.hasStages = dtg.tournament.stages && dtg.tournament.stages.length > 0;
            dtg.filter = {};
            if (dtg.hasStages) {
                dtg.ddlStageChoices = dtg.tournament.stages.map(s => {
                    return { text: s.name, value: s.id };
                });
                dtg.ddlStageChoices.unshift({ text: 'All', value: null });
            }

            $timeout(() => {
                dtg.filter.stageId = null;
            });
            dtg.app.updatePageDetails({
                title: (dtg.tournament.name) + ' - Teams',
                image: dtg.tournament.logo.url
            });
        };

        dtg.teamsFilter = function (team, index, teams) {
            return !dtg.hasStages || !dtg.filter.stageId ||
                dtg.tournament.stages.drbblySingle(s => s.id == dtg.filter.stageId).teams.map(t => t.teamId)
                    .drbblyAny(t => {
                        return t === team.teamId;
                    });
        }

        dtg.rejectRequest = function (request) {
            modalService.confirm({ msg1Raw: 'Reject request?' })
                .then(confirmed => {
                    if (confirmed) {
                        dtg.processRequest(request, false);
                    }
                })
        }

        dtg.onTeamDrop = function (event, ui, bracket, stage) {
            var teamId = Number(ui.draggable.attr('data-teamid'));
            var newTeam = stage.teams.drbblySingle(t => t.teamId === teamId);
            dtg.setTeamBracket(newTeam, stage, bracket.id);
        };

        dtg.setTeamBracket = function (team, stage, bracketId) {
            drbblyTournamentsService.setTeamBracket(team.teamId, stage.id, bracketId)
                .then(() => {
                    team.bracketId = bracketId;
                    dtg.massageStages([stage])
                })
                .catch(error => drbblyCommonService.handleError(error));
        }

        // #region editTeams
        dtg.editTeams = function (stage) {
            modalService.show({
                view: '<drbbly-teamselectionmodal></drbbly-teamselectionmodal>',
                model: {
                    stage: stage,
                    title: 'Select teams participating in ' + stage.name,
                    teams: dtg.tournament.teams.map(t => {
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
                    dtg.massageStages([stage]);
                })
                .catch(function (e) {
                    drbblyCommonService.handleError(e);
                    throw e;
                });
        }
        // #endregion editTeams

        // #region AddStage
        dtg.addStage = function () {
            modalService.show({
                view: '<drbbly-addstagemodal></drbbly-addstagemodal>',
                model: {
                    tournament: dtg.tournament
                }
            })
                .then(stage => {
                    dtg.tournament.stages.push(stage);
                    dtg.massageStages([stage])
                })
                .catch(function () { /* do nothing */ })
        };
        // #endregion AddStage

        dtg.withdrawTeam = function (team) {
            team.isBusy = true;
            modalService.confirm({ msg1Raw: 'Remove ' + team.team.name + ' from the tournament?' })
                .then(confirmed => {
                    if (confirmed) {
                        drbblyTournamentsService.removeTournamentTeam(dtg.tournament.id, team.teamId)
                            .then(() => {
                                dtg.tournament.teams.drbblyRemove(t => t.teamId == team.teamId);
                                dtg.tournament.stages.forEach(stage => {
                                    stage.teams.drbblyRemove(t => t.teamId === team.teamId);
                                    stage.brackets.forEach(b => {
                                        b.teams.drbblyRemove(t => t.teamId === team.teamId);
                                    })
                                })
                            })
                            .catch(e => drbblyCommonService.handleError(e))
                            .finally(() => team.isBusy = false);
                    }
                })
        }

        dtg.processRequest = function (request, shouldApprove) {
            request.isBusy = true;
            drbblyTournamentsService.processJoinRequest(request.id, shouldApprove)
                .then(result => {
                    dtg.tournament.joinRequests.drbblyRemove(r => r.id == request.id);
                    if (shouldApprove) {
                        dtg.tournament.teams.push(result);
                    }
                })
                .catch(e => drbblyCommonService.handleError(e))
                .finally(() => request.isBusy = false);
        }
    }
})();
