(function () {
    'use strict';

    angular.module('appModule')
        .component('drbblyDatetimepicker', {
            bindings: {
                ngModel: '<',
                dateModel: '=?dateModel',
                timeModel: '=?timeModel',
                dateChanged: '<',
                timeChanged: '<',
                valueChanged: '<',
                options: '<'
            },
            require: {
                ngModelCtrl: 'ngModel'
            },
            controllerAs: 'dtp',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['drbblyDatetimeService', '$timeout', '$scope'];
    function controllerFn(drbblyDatetimeService, $timeout, $scope) {
        var dtp = this;

        dtp.$onInit = function () {
            dtp._ngModel = angular.copy(dtp.ngModel);
            dtp.options = dtp.options || {};
            dtp.dateOptions = getDateOptions(dtp.options.datepicker || {});
            dtp.timeOptions = getTimeOptions(dtp.options.timepicker || {});
            dtp.popupOptions = getDatePopupOptions();

            dtp._dateModel = angular.copy(dtp.dateOptions.initDate);
            dtp._timeModel = getInitialTime();

            if (!dtp._ngModel) {
                dtp._ngModel = dtp._dateModel;
                drbblyDatetimeService.copyTime(dtp._timeModel, dtp._ngModel);
            }
        };

        dtp._dateChanged = function () {
            dtp.ngModelCtrl.$setDirty();
            dtp._ngModel = dtp._dateModel;
            if (dtp._ngModel) {
                dtp.ngModelCtrl.$setValidity('required', true);
                if (!dtp._timeModel) {
                    dtp._timeModel = new Date(dtp._dateModel);
                }
                drbblyDatetimeService.copyTime(dtp._timeModel, dtp._ngModel);
            }
            else {
                dtp.ngModelCtrl.$setValidity('required', false);
            }
            if (dtp.dateChanged) {
                dtp.dateChanged(dtp._ngModel);
            }
            if (dtp.valueChanged) {
                dtp.valueChanged(dtp._ngModel);
            }
        };

        dtp._timeChanged = function () {
            dtp.ngModelCtrl.$setDirty();
            dtp.setTouched();
            if (dtp._ngModel) {
                drbblyDatetimeService.copyTime(dtp._timeModel, dtp._ngModel);
                if (dtp.timeChanged) {
                    dtp.timeChanged(dtp._ngModel);
                }
                if (dtp.valueChanged) {
                    dtp.valueChanged(dtp._ngModel);
                }
            }
        };

        dtp.$onChanges = function (changes) {
            if (changes.ngModel) {
                dtp._ngModel = angular.copy(dtp.ngModel);
                dtp._dateModel = angular.copy(dtp.ngModel);
                dtp._timeModel = angular.copy(dtp.ngModel);
            }
        };

        dtp.setTouched = function () {
            dtp.ngModelCtrl.$setTouched();
        };

        dtp.open = function () {
            dtp.popupOptions.isOpen = true;
            dtp.setTouched();
        };

        function getInitialTime() {
            var time = dtp._ngModel ? angular.copy(dtp._ngModel) : new Date(angular.copy(dtp._dateModel));
            time.setSeconds(0);
            time.setMilliseconds(0);
            return time;
        }

        function getDatePopupOptions() {
            return {
                altInputFormats: ['M!/d!/yyyy'],
                closeTextKey: 'site.Close',
                format: 'dd/MMM/yyyy',
                isOpen: false
            };
        }

        function getDateOptions(override) {
            return {
                initDate: dtp._ngModel || override.initDate || drbblyDatetimeService.removeTime(new Date()),
                dateDisabled: override.dateDisabled,
                datepickerMode: override.datepickerMode || 'day',
                maxDate: override.maxDate,
                minDate: override.minDate,
                showWeeks: false,
                startingDay: 0
            };
        }

        function getTimeOptions(override) {
            return {
                hourStep: 1,
                minuteStep: override.minuteStep || 30,
                readonlyInput: true
            };
        }
    }
})();
