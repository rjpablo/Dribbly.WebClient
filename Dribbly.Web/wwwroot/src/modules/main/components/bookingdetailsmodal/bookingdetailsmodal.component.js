(function () {
    'use strict';

    angular.module('mainModule')
        .component('drbblyBookingdetailsmodal', {
            bindings: {
                model: '<',
                context: '<',
                options: '<'
            },
            controllerAs: 'bgm',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['$scope', 'modalService', 'drbblyEventsService', 'drbblyBookingsService', 'drbblyCommonService',
        'drbblyDatetimeService', 'drbblyAccountsService', 'constants'];
    function controllerFn($scope, modalService, drbblyEventsService, drbblyBookingsService, drbblyCommonService,
        drbblyDatetimeService, drbblyAccountsService, constants) {
        var bgm = this;

        bgm.$onInit = function () {
            bgm.minDuration = 30;
            setTypeAheadConfig();

            if (bgm.options.isEdit) {
                bgm.isBusy = true;
                drbblyBookingsService.getBooking(bgm.model.booking.id)
                    .then(function (booking) {
                        bgm.isBusy = false;

                        booking.start = new Date(drbblyDatetimeService.toUtcString(booking.start));
                        booking.end = new Date(drbblyDatetimeService.toUtcString(booking.end));
                        booking.dateAdded = new Date(drbblyDatetimeService.toUtcString(booking.dateAdded));

                        bgm.saveModel = angular.copy(booking || {});
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
                bgm.saveModel = angular.copy(bgm.model.booking || {});
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
                entityTypes: [constants.enums.entityType.Account],
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
            bgm.frmBookingDetails.$setDirty();
        }

        function bookedByRemoved() {
            bgm.frmBookingDetails.$setDirty();
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
            bgm.frmBookingDetails.$setDirty();
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
            if (bgm.frmBookingDetails.$dirty) {
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
            if (bgm.frmBookingDetails.$valid) {
                bgm.saveModel.start = bgm.saveModel.start.toISOString();
                bgm.saveModel.end = bgm.saveModel.end.toISOString();
                bgm.saveModel.bookedById = bgm.bookedByChoice && bgm.bookedByChoice.length ? bgm.bookedByChoice[0].value : null;

                if (bgm.options.isEdit) {
                    drbblyBookingsService.updateBooking(bgm.saveModel)
                        .then(function () {
                            close(bgm.saveModel);
                        })
                        .catch(function (error) {
                            drbblyCommonService.handleError(error);
                        });
                }
                else {
                    drbblyBookingsService.addBooking(bgm.saveModel)
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
