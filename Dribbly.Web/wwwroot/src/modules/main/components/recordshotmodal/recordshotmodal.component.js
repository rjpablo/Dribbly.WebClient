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

    controllerFn.$inject = ['$scope', 'modalService', 'drbblyEventsService', 'constants', 'drbblyOverlayService',
        'drbblyGameeventsService', 'drbblyCommonService'];
    function controllerFn($scope, modalService, drbblyEventsService, constants, drbblyOverlayService,
        drbblyGameeventsService, drbblyCommonService) {
        var rsm = this;

        rsm.$onInit = function () {
            rsm.overlay = drbblyOverlayService.buildOverlay();
            rsm.saveModel = angular.copy(rsm.model, {});
            rsm.saveModel.shot.isMade = !rsm.saveModel.shot.isMiss;
            setTeams();
            rsm.allPlayers = rsm.opposingTeam.players.concat(rsm.shooterTeam.players);
            rsm.shooterOptions = rsm.opposingTeam.players.concat(rsm.shooterTeam.players)
                .drbblyWhere(p => p.isInGame);

            if (rsm.model.isEdit) {
                if (rsm.saveModel.withRebound) {
                    rsm.reboundPlayerOptions = rsm.opposingTeam.players;
                    rsm.rebound = rsm.saveModel.rebound;
                    rsm.rebound.isNew = false;
                    rsm.rebound.performedBy = getGamePlayer(rsm.saveModel.rebound.performedById);
                }
                if (rsm.saveModel.withAssist) {
                    rsm.assistPlayerOptions = rsm.shooterTeam.players
                        .drbblyWhere(p => p.id !== rsm.saveModel.performedBy.id);
                    rsm.assist = rsm.saveModel.assist;
                    rsm.assist.isNew = false;
                    rsm.saveModel.assist.performedBy = getGamePlayer(rsm.saveModel.assist.performedById);
                }
                if (rsm.saveModel.withBlock) {
                    rsm.blockPlayerOptions = rsm.opposingTeam.players;
                    rsm.block = rsm.saveModel.block;
                    rsm.block.isNew = false;
                    rsm.block.performedBy = getGamePlayer(rsm.saveModel.block.performedById);
                }
                if (rsm.saveModel.withFoul) {
                    rsm.foulPlayerOptions = rsm.opposingTeam.players.drbblyWhere(p => true);
                    rsm.foulPlayerOptions.sort((a, b) => {
                        return a.isInGame && !b.isInGame ? -1 :
                            b.isInGame && !a.isInGame ? 1 :
                                a.isInGame && b.isInGame ? (a.jerseyNo - b.jerseyNo) :
                                    0;
                    });
                    rsm.foulTypeOptions = constants.Fouls;
                    rsm.foul = rsm.saveModel.foul;
                    rsm.foul.isNew = false;
                    rsm.foul.performedBy = getGamePlayer(rsm.saveModel.foul.performedById);
                    rsm.foul.foul = rsm.foulTypeOptions.drbblySingle(f => f.id === rsm.saveModel.foul.foulId);
                }
            }
            else {
                rsm.saveModel.shot.isNew = true;
                if (rsm.saveModel.withFoul) {
                    rsm.addFoul();
                }
            }

            rsm.context.setOnInterrupt(rsm.onInterrupt);
            drbblyEventsService.on('modal.closing', function (event, reason, result) {
                if (!rsm.context.okToClose) {
                    event.preventDefault();
                    rsm.onInterrupt();
                }
            }, $scope);
        };

        function getGamePlayer(accountId) {
            return rsm.allPlayers.drbblySingle(p => p.teamMembership.memberAccountId === accountId);
        }

        rsm.addFoul = function () {
            rsm.foulPlayerOptions = rsm.opposingTeam.players.drbblyWhere(p => true); //returns a new array
            rsm.foulPlayerOptions.sort((a, b) => {
                return a.isInGame && !b.isInGame ? -1 :
                    b.isInGame && !a.isInGame ? 1 :
                        a.isInGame && b.isInGame ? (a.jerseyNo - b.jerseyNo) :
                            0;
            });
            rsm.foulTypeOptions = constants.Fouls;
            rsm.saveModel.withFoul = true;

            if (!rsm.foul) {
                rsm.foul = { isNew: true };
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
                    type: constants.enums.gameEventTypeEnum.ShotBlock,
                    isNew: true
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
                    type: constants.enums.gameEventTypeEnum.Rebound,
                    isNew: true
                };
                if (rsm.reboundPlayerOptions.length === 1) {
                    // Set as default if there's only one
                    rsm.rebound.performedBy = rsm.reboundPlayerOptions[0];
                }
            }
        };

        rsm.onShotPerformedBySelect = () => rsm.saveModel.shot.isModified = !rsm.saveModel.shot.isNew;
        rsm.onReboundPerformedBySelect = () => rsm.rebound.isModified = !rsm.rebound.isNew;
        rsm.onAssistPerformedBySelect = () => rsm.assist.isModified = !rsm.assist.isNew;
        rsm.onBlockPerformedBySelect = () => rsm.block.isModified = !rsm.block.isNew;
        rsm.onFoulPerformedBySelect = () => rsm.foul.isModified = !rsm.foul.isNew;

        rsm.addAssist = function () {
            rsm.assistPlayerOptions = rsm.shooterTeam.players
                .drbblyWhere(p => p.teamMembership.memberAccountId !== rsm.saveModel.performedBy.teamMembership.memberAccountId
                    && p.isInGame);
            rsm.saveModel.withAssist = true;

            if (!rsm.assist) {
                rsm.assist = {
                    type: constants.enums.gameEventTypeEnum.Assist,
                    isNew: true
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
            rsm.saveModel.shot.isMiss = !isMade;
            rsm.saveModel.shot.isModified = true;
            if (isMade) {
                rsm.saveModel.withBlock = false;
                rsm.saveModel.withRebound = false;
            } else {
                rsm.saveModel.withAssist = false;
            }
        };

        rsm.revert = function () {
            modalService.confirm({
                titleRaw: 'Delete Shot',
                msg1Raw: 'Delete Shot?',
                container: rsm.options.container
            })
                .then(confirmed => {
                    if (confirmed) {
                        rsm.isBusy = true;
                        rsm.overlay.setToBusy("Deleting...");
                        drbblyGameeventsService.delete(rsm.saveModel.shot.id)
                            .then(result => {
                                result.shotIsDeleted = true;
                                close(result);
                            })
                            .catch(err => {
                                drbblyCommonService.handleError(err);
                            })
                            .finally(() => {
                                rsm.isBusy = false;
                                rsm.overlay.setToReady();
                            });
                    }
                })
        }

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
                        id: rsm.saveModel.shot.id,
                        points: rsm.saveModel.shot.points,
                        isMiss: rsm.saveModel.shot.isMiss,
                        performedById: rsm.saveModel.performedBy.teamMembership.memberAccountId,
                        teamId: rsm.saveModel.performedBy.teamMembership.teamId,
                        gameId: rsm.saveModel.shot.game.id,
                        period: rsm.saveModel.shot.period,
                        clockTime: rsm.saveModel.shot.clockTime,
                    },
                    withFoul: rsm.saveModel.withFoul || (rsm.foul && !rsm.foul.isNew),
                    withBlock: rsm.saveModel.withBlock || (rsm.block && !rsm.block.isNew),
                    withAssist: rsm.saveModel.withAssist || (rsm.assist && !rsm.assist.isNew),
                    withRebound: (rsm.saveModel.withRebound && !rsm.saveModel.withFoul) || (rsm.rebound && !rsm.rebound.isNew)
                };

                if (result.withFoul) {
                    result.foul = {
                        id: rsm.foul.id,
                        foulId: rsm.foul.foul.id,
                        foul: rsm.foul.foul,
                        performedById: rsm.foul.performedBy.teamMembership.account.id,
                        performedBy: rsm.foul.performedBy.teamMembership.account,
                        isTechnical: rsm.foul.foul.isTechnical,
                        isFlagrant: rsm.foul.foul.isFlagrant,
                        gameId: rsm.saveModel.game.id,
                        teamId: rsm.foul.performedBy.teamMembership.teamId,
                        performedByGamePlayer: rsm.foul.performedBy,
                        period: rsm.saveModel.shot.period,
                        clockTime: rsm.saveModel.shot.clockTime,
                        isNew: rsm.foul.isNew,
                        isModified: rsm.foul.isModified,
                        isDeleted: !rsm.saveModel.withFoul,
                        shotId: rsm.saveModel.shot.id
                    }
                }

                if (result.withBlock) {
                    result.block = {
                        id: rsm.block.id,
                        type: constants.enums.gameEventTypeEnum.ShotBlock,
                        performedById: rsm.block.performedBy.teamMembership.account.id,
                        performedBy: rsm.block.performedBy.teamMembership.account,
                        gameId: rsm.saveModel.game.id,
                        teamId: rsm.block.performedBy.teamMembership.teamId,
                        performedByGamePlayer: rsm.block.performedBy,
                        period: rsm.saveModel.shot.period,
                        clockTime: rsm.saveModel.shot.clockTime,
                        isNew: rsm.block.isNew,
                        isModified: rsm.block.isModified,
                        isDeleted: !rsm.saveModel.withBlock,
                        shotId: rsm.saveModel.shot.id
                    }
                }

                if (result.withAssist) {
                    result.assist = {
                        id: rsm.assist.id,
                        type: constants.enums.gameEventTypeEnum.Assist,
                        performedById: rsm.assist.performedBy.teamMembership.account.id,
                        performedBy: rsm.assist.performedBy.teamMembership.account,
                        gameId: rsm.saveModel.game.id,
                        teamId: rsm.assist.performedBy.teamMembership.teamId,
                        performedByGamePlayer: rsm.assist.performedBy,
                        period: rsm.saveModel.shot.period,
                        clockTime: rsm.saveModel.shot.clockTime,
                        isNew: rsm.assist.isNew,
                        isModified: rsm.assist.isModified,
                        isDeleted: !rsm.saveModel.withAssist,
                        shotId: rsm.saveModel.shot.id
                    }
                }

                if (result.withRebound) {
                    result.rebound = {
                        id: rsm.rebound.id,
                        type: rsm.rebound.performedBy.teamMembership.teamId === rsm.saveModel.performedBy.teamMembership.teamId ?
                            constants.enums.gameEventTypeEnum.OffensiveRebound :
                            constants.enums.gameEventTypeEnum.DefensiveRebound,
                        performedById: rsm.rebound.performedBy.teamMembership.account.id,
                        performedBy: rsm.rebound.performedBy.teamMembership.account,
                        gameId: rsm.saveModel.game.id,
                        teamId: rsm.rebound.performedBy.teamMembership.teamId,
                        performedByGamePlayer: rsm.rebound.performedBy,
                        period: rsm.saveModel.shot.period,
                        clockTime: rsm.saveModel.shot.clockTime,
                        isNew: rsm.rebound.isNew,
                        isModified: rsm.rebound.isModified,
                        isDeleted: !rsm.saveModel.withRebound || rsm.saveModel.withFoul,
                        shotId: rsm.saveModel.shot.id
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
