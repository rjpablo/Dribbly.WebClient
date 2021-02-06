(function () {
    'use strict';

    angular.module('mainModule')
        .component('drbblyGameresultmodal', {
            bindings: {
                model: '<',
                context: '<',
                options: '<'
            },
            controllerAs: 'bgm',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['$scope', 'modalService', 'drbblyEventsService', 'drbblyGamesService', 'drbblyCommonService',
        'drbblyDatetimeService', 'constants', 'drbblyOverlayService', 'drbblyFormshelperService', 'i18nService', '$timeout'];
    function controllerFn($scope, modalService, drbblyEventsService, drbblyGamesService, drbblyCommonService,
        drbblyDatetimeService, constants, drbblyOverlayService, drbblyFormshelperService, i18nService, $timeout) {
        var bgm = this;

        bgm.$onInit = function () {
            bgm.overlay = drbblyOverlayService.buildOverlay();
            bgm.gameStatus = constants.enums.gameStatus;
            bgm.selectedCourts = [];
            bgm.saveModel = {};

            bgm.isBusy = true;
            bgm.overlay.setToBusy();
            drbblyGamesService.getGame(bgm.model.gameId)
                .then(function (game) {
                    bgm.overlay.setToReady();
                    bgm.isBusy = false;
                    game.start = drbblyDatetimeService.toLocalDateTime(game.start);
                    bgm.saveModel = angular.copy(game || {});
                    setDdlOptions();
                    setStartDateOptions();
                    setTypeAheadConfig();
                    $timeout(function () {
                        bgm.winningTeamId = bgm.saveModel.winningTeamId;
                    });
                })
                .catch(function (error) {
                    bgm.isBusy = false;
                    bgm.overlay.setToError();
                });

            bgm.context.setOnInterrupt(bgm.onInterrupt);
            drbblyEventsService.on('modal.closing', function (event, reason, result) {
                if (!bgm.context.okToClose) {
                    event.preventDefault();
                    bgm.onInterrupt();
                }
            }, $scope);
        };

        function setDdlOptions() {
            bgm.ddlWinnerOptions = [];
            bgm.ddlWinnerOptions.push({
                text: getTeamDdlName(bgm.saveModel.team1, 0),
                value: bgm.saveModel.team1.id
            });
            bgm.ddlWinnerOptions.push({
                text: getTeamDdlName(bgm.saveModel.team2, 1),
                value: bgm.saveModel.team2.id
            });
            drbblyFormshelperService.addDdlNullChoice(bgm.ddlWinnerOptions);
        }

        function getTeamDdlName(team, teamEnumValue) {
            return i18nService.getString('app.TeamsEnum.' + teamEnumValue) +
                ' (' + (team.isOpen ? i18nService.getString('app.OpenTeam') : team.name) + ')';
        }

        function setTypeAheadConfig() {
            bgm.typeAheadConfig = {
                entityTypes: [constants.enums.entityType.Court]
            };

            bgm.team1TypeAheadConfig = {
                entityTypes: [constants.enums.entityType.Team],
                excludeValues: [bgm.saveModel.team2Id]
            };

            bgm.team2TypeAheadConfig = {
                entityTypes: [constants.enums.entityType.Team],
                excludeValues: [bgm.saveModel.team1Id]
            };
        }

        bgm.dateOpened = false;

        bgm.startChanged = function (newValue) {
            bgm.saveModel.start = newValue;
        };

        bgm.startTimeChanged = function (newDate, oldDate) {
            console.log(bgm.saveModel.start);
        };

        function setStartDateOptions() {
            bgm.startDateOptions = {
                datepicker: {
                    dateDisabled: function (params) {
                        return params.mode === 'day' && drbblyDatetimeService.compareDatesOnly(params.date, new Date()) === -1;
                    }
                }
            };
        }

        bgm.winnerChanged = function () {
            bgm.saveModel.winningTeamId = bgm.winningTeamId;
        };

        bgm.onInterrupt = function (reason) {
            if (bgm.frmGameDetails.$dirty) {
                modalService.showUnsavedChangesWarning()
                    .then(function (response) {
                        if (response) {
                            bgm.context.okToClose = true;
                            bgm.context.dismiss(reason);
                        }
                    })
                    .catch(function (response) {
                        console.log(response);
                    });
            }
            else {
                bgm.context.okToClose = true;
                bgm.context.dismiss(reason);
            }
        };

        bgm.handleSubmitClick = function () {
            if (bgm.frmGameDetails.$valid) {
                var saveModel = angular.copy(bgm.saveModel);
                if (saveModel.status === constants.enums.gameStatus.Started && saveModel.winningTeamId) {
                    modalService.confirm({ msg1Key: 'app.SettingTheWinnerWillEndTheGame' })
                        .then(function (result) {
                            if (result) {
                                submit(saveModel);
                            }
                        })
                }
                else {
                    submit(saveModel);
                }
            }
        };

        function submit(saveModel) {
            saveModel.gameId = saveModel.id;
            bgm.isBusy = true;
            drbblyGamesService.updateGameResult(saveModel)
                .then(function () {
                    bgm.isBusy = false;
                    close({ savedChanges: true });
                }, function (error) {
                    bgm.isBusy = false;
                    drbblyCommonService.handleError(error);
                });
        }

        function close(result) {
            bgm.context.okToClose = true;
            bgm.context.submit(result);
        }

        bgm.cancel = function () {
            bgm.onInterrupt('cancelled');
        };
    }
})();
