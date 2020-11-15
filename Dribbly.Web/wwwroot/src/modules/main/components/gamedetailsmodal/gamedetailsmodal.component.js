﻿(function () {
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
                if (!bgm.saveModel.start) {
                    bgm.saveModel.start = new Date();
                }
                setStartDateOptions();
            }

            bgm.context.setOnInterrupt(bgm.onInterrupt);
            drbblyEventsService.on('modal.closing', function (event, reason, result) {
                if (!bgm.context.okToClose) {
                    event.preventDefault();
                    bgm.onInterrupt();
                }
            }, $scope);
        };

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