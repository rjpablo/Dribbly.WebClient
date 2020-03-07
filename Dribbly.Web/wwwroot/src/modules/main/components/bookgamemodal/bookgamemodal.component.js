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
        var _okToClose;

        bgm.$onInit = function () {
            bgm.saveModel = angular.copy(bgm.model.game || {});
            setStartDateOptions();
            setEndDateOptions();

            bgm.context.setOnInterrupt(bgm.onInterrupt);
            drbblyEventsService.on('modal.closing', function (event, reason, result) {
                if (!_okToClose) {
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
                disbled: function (date, mode) {
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
                            _okToClose = true;
                            bgm.context.dismiss(reason);
                        }
                    })
                    .catch(function (response) {
                        console.log(response);
                    });
            }
            else {
                _okToClose = true;
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
            _okToClose = true;
            bgm.context.submit(result);
        }

        bgm.cancel = function () {
            bgm.onInterrupt('cancelled');
        };
    }
})();
