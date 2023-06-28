(function () {
    'use strict';

    angular.module('mainModule')
        .component('drbblyRecordshotmodal', {
            bindings: {
                model: '<',
                context: '<',
                options: '<'
            },
            controllerAs: 'rsm',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['$scope', 'modalService', 'drbblyEventsService', 'drbblyGamesService', 'drbblyCommonService',
        'drbblyTimerhelperService', 'constants', 'drbblyOverlayService', 'drbblyFormshelperService', 'i18nService', '$timeout'];
    function controllerFn($scope, modalService, drbblyEventsService, drbblyGamesService, drbblyCommonService,
        drbblyTimerhelperService, constants, drbblyOverlayService, drbblyFormshelperService, i18nService, $timeout) {
        var rsm = this;

        rsm.$onInit = function () {
            rsm.overlay = drbblyOverlayService.buildOverlay();
            rsm.saveModel = angular.copy(rsm.model, {});
            setTeams();
            rsm.context.setOnInterrupt(rsm.onInterrupt);
            drbblyEventsService.on('modal.closing', function (event, reason, result) {
                if (!rsm.context.okToClose) {
                    event.preventDefault();
                    rsm.onInterrupt();
                }
            }, $scope);
        };

        rsm.addFoul = function () {
            rsm.foulPlayerOptions = rsm.opposingTeam.players;
            rsm.foulTypeOptions = constants.Fouls;
            rsm.withFoul = true;

            if (!rsm.foul) {
                rsm.foul = {};
                if (rsm.foulPlayerOptions.length === 1) {
                    // Set as default if there's only one
                    rsm.foul.performedBy = rsm.foulPlayerOptions[0];
                }
                //set Shooting fouls as the default
                rsm.foul.foul = rsm.foulTypeOptions.drbblySingle(f => f.name === 'Shooting');
            }
        };

        rsm.removeFoul = function () {
            rsm.withFoul = false;
        };

        rsm.onInterrupt = function (reason) {
            if (rsm.frmShot.$dirty) {
                modalService.showUnsavedChangesWarning()
                    .then(function (response) {
                        if (response) {
                            rsm.context.okToClose = true;
                            rsm.context.dismiss(reason);
                        }
                    })
                    .catch(function (response) {
                        console.log(response);
                    });
            }
            else {
                rsm.context.okToClose = true;
                rsm.context.dismiss(reason);
            }
        };

        function setTeams() {
            rsm.shooterTeam = rsm.model.game.team1.teamId === rsm.model.performedBy.teamId ?
                rsm.model.game.team1 : rsm.model.game.team2;
            rsm.opposingTeam = rsm.model.game.team1.teamId === rsm.model.performedBy.teamId ?
                rsm.model.game.team2 : rsm.model.game.team1;
        }

        rsm.handleSubmitClick = function () {
            if (rsm.frmShot.$valid) {
                var result = {
                    shot: {
                        points: rsm.saveModel.points,
                        isMiss: rsm.saveModel.isMiss,
                        performedById: rsm.saveModel.performedBy.memberAccountId,
                        teamId: rsm.saveModel.performedBy.teamId,
                        gameId: rsm.saveModel.game.id,
                        period: rsm.saveModel.period,
                        clockTime: rsm.saveModel.clockTime,
                    },
                    withFoul: rsm.withFoul
                };

                if (result.withFoul) {
                    result.foul = {
                        foulId: rsm.foul.foul.id,
                        foul: rsm.foul.foul,
                        performedById: rsm.foul.performedBy.teamMembership.account.id,
                        performedBy: rsm.foul.performedBy.teamMembership.account,
                        isTechnical: rsm.foul.foul.isTechnical,
                        isFlagrant: rsm.foul.foul.isFlagrant,
                        gameId: rsm.saveModel.game.id,
                        teamId: rsm.foul.performedBy.teamMembership.teamId,
                        performedByGamePlayer: rsm.foul.performedBy,
                        period: rsm.saveModel.period,
                        clockTime: rsm.saveModel.clockTime
                    }
                }

                close(result);
            }
        };

        function close(result) {
            rsm.context.okToClose = true;
            rsm.context.submit(result);
        }

        rsm.cancel = function () {
            rsm.onInterrupt('cancelled');
        };
    }
})();
