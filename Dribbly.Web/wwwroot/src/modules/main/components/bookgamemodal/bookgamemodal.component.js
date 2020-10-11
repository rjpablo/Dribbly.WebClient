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

    controllerFn.$inject = ['$scope', 'modalService', 'drbblyEventsService', 'drbblyGamesService', 'drbblyCommonService',
        'drbblyDatetimeService', 'drbblyAccountsService'];
    function controllerFn($scope, modalService, drbblyEventsService, drbblyGamesService, drbblyCommonService,
        drbblyDatetimeService, drbblyAccountsService) {
        var bgm = this;

        bgm.$onInit = function () {
            bgm.minDuration = 30;
            setTypeAheadConfig();

            if (bgm.options.isEdit) {
                bgm.isBusy = true;
                drbblyGamesService.getGame(bgm.model.game.id)
                    .then(function (game) {
                        bgm.isBusy = false;

                        game.start = new Date(drbblyDatetimeService.toUtcString(game.start));
                        game.end = new Date(drbblyDatetimeService.toUtcString(game.end));
                        game.dateAdded = new Date(drbblyDatetimeService.toUtcString(game.dateAdded));

                        bgm.saveModel = angular.copy(game || {});
                        bgm.saveModel.durationMinutes = getDuration();
                        bgm.bookedByChoice = bgm.saveModel.bookedByChoice ? [bgm.saveModel.bookedByChoice] : [];

                        setStartDateOptions();
                        setEndDateOptions();

                    })
                    .catch(function (error) {
                        bgm.isBusy = false;
                    });
            }
            else {
                bgm.saveModel = angular.copy(bgm.model.game || {});
                bgm.saveModel.durationMinutes = getDuration();
                if (!bgm.saveModel.start) {
                    bgm.saveModel.start = new Date();
                    bgm.saveModel.start.setHours(0, 0, 0, 0);
                }
                bgm.saveModel.end = getEndDate();

                setStartDateOptions();
                setEndDateOptions();
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
            bgm.bookedByConfig = {
                onGetSuggestions: getSuggestedUsers,
                onSelect: bookedBySelected,
                onUnselect: bookedByRemoved
            };
        }

        function getSuggestedUsers(keyword) {
            return drbblyAccountsService.getAccountDropDownSuggestions({
                nameSegment: keyword,
                excludeIds: []
            });
        }

        function bookedBySelected(item, selectedItems, event) {
            bgm.frmGameDetails.$setDirty();
        }

        function bookedByRemoved() {
            bgm.frmGameDetails.$setDirty();
        }

        bgm.dateOpened = false;

        bgm.startChanged = function (newValue) {
            bgm.saveModel.start = newValue;
            bgm.saveModel.end = getEndDate();
        };

        bgm.startTimeChanged = function (newDate, oldDate) {
            console.log(bgm.saveModel.start);
        };

        bgm.getFormattedDuration = function () {
            return duration.humanize();
        };

        bgm.adjustDuration = function (adjustment) {
            bgm.frmGameDetails.$setDirty();
            bgm.saveModel.durationMinutes += adjustment;
            if (bgm.saveModel.start) {
                bgm.saveModel.end = getEndDate();
            }
        };

        bgm.canAdjustDuration = function (adjustment) {
            var newDuration = bgm.saveModel.durationMinutes + adjustment;
            return newDuration >= bgm.minDuration;
        };

        function getDuration() {
            if (bgm.saveModel.start && bgm.saveModel.end) {
                return drbblyDatetimeService.getDiff(bgm.saveModel.start, bgm.saveModel.end);
            }
            return 120; // default to 2 hrs
        }

        function getEndDate() {
            if (bgm.saveModel.start) {
                return drbblyDatetimeService.add(bgm.saveModel.start, bgm.saveModel.durationMinutes, 'minutes');
            }
            return null;
        }

        function setStartDateOptions() {
            bgm.startDateOptions = {
                datepicker: {
                    dateDisabled: function (params) {
                        return params.mode === 'day' && drbblyDatetimeService.compareDatesOnly(params.date, new Date()) === -1;
                    }
                }
            };
        }

        function setEndDateOptions() {
            bgm.endDateOptions = {
                datepicker: {
                    dateDisabled: function (params) {
                        return params.mode === 'day' &&
                            drbblyDatetimeService.compareDatesOnly(params.date, bgm.saveModel.start || new Date()) === -1;
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
                bgm.saveModel.start = bgm.saveModel.start.toISOString();
                bgm.saveModel.end = bgm.saveModel.end.toISOString();
                bgm.saveModel.bookedById = bgm.bookedByChoice && bgm.bookedByChoice.length ? bgm.bookedByChoice[0].value : null;

                if (bgm.options.isEdit) {
                    drbblyGamesService.updateGame(bgm.saveModel)
                        .then(function () {
                            close(bgm.saveModel);
                        })
                        .catch(function (error) {
                            drbblyCommonService.handleError(error);
                        });
                }
                else {
                    drbblyGamesService.bookGame(bgm.saveModel)
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
