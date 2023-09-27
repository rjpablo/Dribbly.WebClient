﻿(function () {
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

    controllerFn.$inject = ['$scope', 'modalService', 'drbblyEventsService', 'constants'];
    function controllerFn($scope, modalService, drbblyEventsService, constants) {
        var rsm = this;

        rsm.$onInit = function () {
            rsm.saveModel = angular.copy(rsm.model, {});
            rsm.saveModel.isMade = !rsm.saveModel.isMiss;
            setTeams();
            rsm.shooterOptions = rsm.opposingTeam.players.concat(rsm.shooterTeam.players)
                .drbblyWhere(p => p.isInGame);

            if (rsm.saveModel.withFoul) {
                rsm.addFoul();
            }

            rsm.context.setOnInterrupt(rsm.onInterrupt);
            drbblyEventsService.on('modal.closing', function (event, reason, result) {
                if (!rsm.context.okToClose) {
                    event.preventDefault();
                    rsm.onInterrupt();
                }
            }, $scope);
        };

        rsm.addFoul = function () {
            rsm.foulPlayerOptions = rsm.opposingTeam.players.drbblyWhere( p => true); //returns a new array
            rsm.foulPlayerOptions.sort((a, b) => {
                return a.isInGame && !b.isInGame ? -1 :
                    b.isInGame && !a.isInGame ? 1 :
                        a.isInGame && b.isInGame ? (a.jerseyNo - b.jerseyNo) :
                            0;
            });
            rsm.foulTypeOptions = constants.Fouls;
            rsm.saveModel.withFoul = true;

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

        rsm.addBlock = function () {
            rsm.blockPlayerOptions = rsm.opposingTeam.players
                .drbblyWhere(p => p.isInGame);
            rsm.saveModel.withBlock = true;

            if (!rsm.block) {
                rsm.block = {
                    type: constants.enums.gameEventTypeEnum.ShotBlock
                };
                if (rsm.blockPlayerOptions.length === 1) {
                    // Set as default if there's only one
                    rsm.block.performedBy = rsm.blockPlayerOptions[0];
                }
            }
        };

        rsm.addRebound = function () {
            rsm.reboundPlayerOptions = rsm.opposingTeam.players.concat(rsm.shooterTeam.players)
                .drbblyWhere(p => p.isInGame);
            rsm.saveModel.withRebound = true;

            if (!rsm.rebound) {
                rsm.rebound = {
                    type: constants.enums.gameEventTypeEnum.Rebound
                };
                if (rsm.reboundPlayerOptions.length === 1) {
                    // Set as default if there's only one
                    rsm.rebound.performedBy = rsm.reboundPlayerOptions[0];
                }
            }
        };

        rsm.addAssist = function () {
            rsm.assistPlayerOptions = rsm.shooterTeam.players
                .drbblyWhere(p => p.teamMembership.memberAccountId !== rsm.saveModel.performedBy.teamMembership.memberAccountId
                    && p.isInGame);
            rsm.saveModel.withAssist = true;

            if (!rsm.assist) {
                rsm.assist = {
                    type: constants.enums.gameEventTypeEnum.Assist
                };
                if (rsm.assistPlayerOptions.length === 1) {
                    // Set as default if there's only one
                    rsm.assist.performedBy = rsm.assistPlayerOptions[0];
                }
            }
        };

        rsm.removeFoul = function () {
            rsm.saveModel.withFoul = false;
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

        rsm.onMadeMissChanged = function (isMade) {
            rsm.saveModel.isMiss = !isMade;
            if (isMade) {
                rsm.saveModel.withBlock = false;
                rsm.saveModel.withRebound = false;
            } else {
                rsm.saveModel.withAssist = false;
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
                        performedById: rsm.saveModel.performedBy.teamMembership.memberAccountId,
                        teamId: rsm.saveModel.performedBy.teamMembership.teamId,
                        gameId: rsm.saveModel.game.id,
                        period: rsm.saveModel.period,
                        clockTime: rsm.saveModel.clockTime,
                    },
                    withFoul: rsm.saveModel.withFoul,
                    withBlock: rsm.saveModel.withBlock,
                    withAssist: rsm.saveModel.withAssist,
                    withRebound: rsm.saveModel.withRebound && !rsm.saveModel.withFoul,
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

                if (result.withBlock) {
                    result.block = {
                        type: constants.enums.gameEventTypeEnum.ShotBlock,
                        performedById: rsm.block.performedBy.teamMembership.account.id,
                        performedBy: rsm.block.performedBy.teamMembership.account,
                        gameId: rsm.saveModel.game.id,
                        teamId: rsm.block.performedBy.teamMembership.teamId,
                        performedByGamePlayer: rsm.block.performedBy,
                        period: rsm.saveModel.period,
                        clockTime: rsm.saveModel.clockTime
                    }
                }

                if (result.withAssist) {
                    result.assist = {
                        type: constants.enums.gameEventTypeEnum.Assist,
                        performedById: rsm.assist.performedBy.teamMembership.account.id,
                        performedBy: rsm.assist.performedBy.teamMembership.account,
                        gameId: rsm.saveModel.game.id,
                        teamId: rsm.assist.performedBy.teamMembership.teamId,
                        performedByGamePlayer: rsm.assist.performedBy,
                        period: rsm.saveModel.period,
                        clockTime: rsm.saveModel.clockTime
                    }
                }

                if (result.withRebound) {
                    result.rebound = {
                        type: rsm.rebound.performedBy.teamMembership.teamId === rsm.saveModel.performedBy.teamMembership.teamId ?
                            constants.enums.gameEventTypeEnum.OffensiveRebound :
                            constants.enums.gameEventTypeEnum.DefensiveRebound,
                        performedById: rsm.rebound.performedBy.teamMembership.account.id,
                        performedBy: rsm.rebound.performedBy.teamMembership.account,
                        gameId: rsm.saveModel.game.id,
                        teamId: rsm.rebound.performedBy.teamMembership.teamId,
                        performedByGamePlayer: rsm.rebound.performedBy,
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
