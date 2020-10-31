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
        'drbblyDatetimeService', 'constants'];
    function controllerFn($scope, modalService, drbblyEventsService, drbblyGamesService, drbblyCommonService,
        drbblyDatetimeService, constants) {
        var bgm = this;

        bgm.$onInit = function () {
            bgm.minDuration = 30;
            bgm.gameStatus = constants.enums.gameStatus;
            if (bgm.options.isEdit) {
                bgm.isBusy = true;
                drbblyGamesService.getGame(bgm.model.game.id)
                    .then(function (game) {
                        bgm.isBusy = false;

                        game.start = new Date(drbblyDatetimeService.toUtcString(game.start));
                        game.dateAdded = new Date(drbblyDatetimeService.toUtcString(game.dateAdded));

                        bgm.saveModel = angular.copy(game || {});
                        setStartDateOptions();

                    })
                    .catch(function (error) {
                        bgm.isBusy = false;
                    });
            }
            else {
                bgm.saveModel = angular.copy(bgm.model.game || {});
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

                if (bgm.options.isEdit) {
                    drbblyGamesService.updateGame(saveModel)
                        .then(function () {
                            close(saveModel);
                        })
                        .catch(function (error) {
                            drbblyCommonService.handleError(error);
                        });
                }
                else {
                    drbblyGamesService.addGame(saveModel)
                        .then(function (result) {
                            close(result);
                        })
                        .catch(function (error) {
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
