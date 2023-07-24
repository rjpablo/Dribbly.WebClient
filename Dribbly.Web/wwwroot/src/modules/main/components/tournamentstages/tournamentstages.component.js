(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyTournamentstages', {
            bindings: {
                app: '<',
                tournament: '<'
            },
            controllerAs: 'tsc',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['drbblyTournamentsService', 'modalService', 'drbblyCommonService', 'constants',
        'authService', 'drbblyOverlayService'];
    function controllerFunc(drbblyTournamentsService, modalService, drbblyCommonService, constants,
        authService, drbblyOverlayService) {
        var tsc = this;

        tsc.$onInit = function () {
            tsc.overlay = drbblyOverlayService.buildOverlay();
            loadStages();
        };

        function loadStages() {
            tsc.isBusy = true;
            drbblyTournamentsService.getTournamentStages(tsc.tournament.id)
                .then(function (stages) {
                    tsc.tournament.stages = stages;
                    var activeStage = stages.drbblyFirstOrDefault(s => s.status === constants.enums.stageStatusEnum.Started);
                    tsc.activeTabIndex = activeStage ? activeStage.id : stages[0].id;
                })
                .catch(error => drbblyCommonService.handleError(error))
                .finally(() => tsc.isBusy = false);
        }

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

        tsc.editTeams = function (stage) {
            modalService.show({
                view: '<drbbly-teamselectionmodal></drbbly-teamselectionmodal>',
                model: {
                    stage: stage,
                    title: 'Select teams participating in ' + stage.name,
                    teams: tsc.tournament.teams.map(t => {
                        return { id: t.teamId, name: t.name, logo: t.logo };
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
                })
                .catch(function (e) {
                    drbblyCommonService.handleError(e);
                    throw e;
                });
        }

        tsc.canDeleteItem = function (stage) {
            return tsc.tournament.addedById === authService.authentication.userId;
        }

        tsc.canEditItem = function (stage) {
            return tsc.tournament.addedById === authService.authentication.userId;
        }
    }
})();
