(function () {
    'use strict';

    angular.module('mainModule')
        .component('drbblyGamedetailsmodal', {
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
        'drbblyDatetimeService', 'constants', 'drbblyOverlayService'];
    function controllerFn($scope, modalService, drbblyEventsService, drbblyGamesService, drbblyCommonService,
        drbblyDatetimeService, constants, drbblyOverlayService) {
        var bgm = this;

        bgm.$onInit = function () {
            bgm.overlay = drbblyOverlayService.buildOverlay();
            bgm.gameStatus = constants.enums.gameStatus;
            bgm.selectedCourts = [];

            if (bgm.model.isEdit) {
                bgm.isBusy = true;
                bgm.overlay.setToBusy();
                drbblyGamesService.getGame(bgm.model.gameId)
                    .then(function (game) {
                        bgm.overlay.setToReady();
                        bgm.isBusy = false;
                        game.start = drbblyDatetimeService.toLocalDateTime(game.start);
                        bgm.saveModel = angular.copy(game || {});
                        setStartDateOptions();
                        setTypeAheadConfig();
                    })
                    .catch(function (error) {
                        bgm.isBusy = false;
                        bgm.overlay.setToError();
                    });
            }
            else {
                bgm.saveModel = {
                    courtId: bgm.model.courtId
                };
                bgm.saveModel.isTeam1Open = true;
                bgm.saveModel.isTeam2Open = true;
                if (!bgm.saveModel.start) {
                    bgm.saveModel.start = new Date();
                }
                setStartDateOptions();
                setTypeAheadConfig();
                if (bgm.saveModel.courtId) {
                    bgm.overlay.setToBusy();
                    drbblyGamesService.getAddGameModal(bgm.saveModel.courtId)
                        .then(function (data) {
                            bgm.selectedCourts.push(data.courtChoice);
                            bgm.overlay.setToReady();
                        })
                        .catch(bgm.overlay.setToError);
                }
            }

            bgm.context.setOnInterrupt(bgm.onInterrupt);
            drbblyEventsService.on('modal.closing', function (event, reason, result) {
                if (!bgm.context.okToClose) {
                    event.preventDefault();
                    bgm.onInterrupt();
                }
            }, $scope);
        };

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

        bgm.submit = function () {
            if (bgm.frmGameDetails.$valid) {
                var saveModel = angular.copy(bgm.saveModel);
                saveModel.start = bgm.saveModel.start.toISOString();
                bgm.isBusy = true;
                if (bgm.model.isEdit) {
                    drbblyGamesService.updateGame(saveModel)
                        .then(function () {
                            bgm.isBusy = false;
                            close(saveModel);
                        }, function (error) {
                            bgm.isBusy = false;
                            drbblyCommonService.handleError(error);
                        });
                }
                else {
                    drbblyGamesService.addGame(saveModel)
                        .then(function (result) {
                            bgm.isBusy = false;
                            close(result);
                        }, function (error) {
                            bgm.isBusy = false;
                            drbblyCommonService.handleError(error);
                        });
                }
            }
        };

        function close(result) {
            bgm.context.okToClose = true;
            bgm.context.submit(result);
        }

        bgm.cancel = function () {
            bgm.onInterrupt('cancelled');
        };
    }
})();
