(function () {
    'use strict';

    angular.module('mainModule')
        .component('drbblyBookgamemodal', {
            bindings: {
                model: '<',
                context: '<',
                options: '<'
            },
            controllerAs: 'bgm',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['$scope', 'modalService', 'drbblyEventsService', 'drbblyGamesService', 'drbblyCommonService'];
    function controllerFn($scope, modalService, drbblyEventsService, drbblyGamesService, drbblyCommonService) {
        var bgm = this;

        bgm.$onInit = function () {
            bgm.saveModel = angular.copy(bgm.model.game || {});
            setStartDateOptions();
            setEndDateOptions();

            bgm.context.setOnInterrupt(bgm.onInterrupt);
            drbblyEventsService.on('modal.closing', function (event, reason, result) {
                if (!bgm.context.okToClose) {
                    event.preventDefault();
                    bgm.onInterrupt();
                }
            }, $scope);
        };

        bgm.dateOpened = false;

        bgm.startTimeChanged = function (newDate, oldDate) {
            console.log(bgm.startTime);
        };

        function setStartDateOptions() {
            bgm.startDateOptions = {
                options: {
                    showWeeks: false,
                    startingDay: 0
                },
                disbled: function (date, mode) {
                    return mode === 'day' && date.getDay() < new Date().getDay();
                },
                open: function ($event, opened) {
                    $event.preventDefault();
                    $event.stopPropagation();
                    bgm.startDateOpened = true;
                }
            };
        }

        function setEndDateOptions() {
            bgm.endDateOptions = {
                options: {
                    showWeeks: false,
                    startingDay: 0
                },
                disabled: function (date, mode) {
                    return mode === 'day' && date.getDay() < new Date().getDay();
                },
                open: function ($event, opened) {
                    $event.preventDefault();
                    $event.stopPropagation();
                    bgm.endDateOpened = true;
                }
            };
        }

        bgm.onInterrupt = function (reason) {
            if (bgm.frmCourtDetails.$dirty) {
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
            bgm.saveModel.start = bgm.saveModel.start.toISOString();
            bgm.saveModel.end = bgm.saveModel.end.toISOString();
            drbblyGamesService.bookGame(bgm.saveModel)
                .then(function (result) {
                    close(result);
                })
                .catch(function (error) {
                    drbblyCommonService.handleError(error);
                });

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
