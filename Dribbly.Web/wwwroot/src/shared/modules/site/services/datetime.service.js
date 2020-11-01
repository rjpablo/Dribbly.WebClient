(function () {
    'use strict';

    angular.module('siteModule')
        .service('drbblyDatetimeService', [function () {

            function removeTime(date) {
                var _date = angular.copy(date);
                _date.setHours(0, 0, 0, 0);
                return _date;
            }

            /**
             * Compares 2 dates, disregarding the time
             * @param {Date} date1 the first date to compare
             * @param {Date} date2 the second date to compare
             * @returns {Number}:
             * 1   - if date1 > date2
             * -1  - if date1 < date2
             * 0   - if date1 === date2
             */
            function compareDatesOnly(date1, date2) {
                var _date1 = removeTime(date1);
                var _date2 = removeTime(date2);
                var diff = _date1 - _date2;

                if (diff === 0) {
                    return diff;
                }

                return diff / Math.abs(diff);
            }

            function add(date, number, period) {
                return moment(date).add(number, period).toDate();
            }

            function copyTime(source, destination) {
                if (!source) {
                    throw new Error('empty source');
                }
                if (!destination) {
                    throw new Error('empty destination');
                }
                destination.setHours(source.getHours(), source.getMinutes(), source.getSeconds(), source.getMilliseconds());
            }

            function getDiff(date1, date2, unit) {
                return moment(date2).diff(date1, unit || 'minutes');
            }

            function toUtcString(dateString) {
                if (dateString) {
                    return dateString.endsWith('Z') ? dateString : dateString + 'Z';
                }

                return null;
            }

            function toUtcDate(dateString) {
                return new Date(toUtcString(dateString));
            }

            function getUtcNow() {
                return new Date(new Date.toUTCString);
            }

            function toLocalDateTime(utcDate) {
                var localDateString = angular.isString(utcDate) ? toUtcDate(utcDate) : utcDate.toLocaleString();
                return new Date(localDateString);
            }

            return {
                add: add,
                compareDatesOnly: compareDatesOnly,
                copyTime: copyTime,
                getDiff: getDiff,
                getUtcNow: getUtcNow,
                toLocalDateTime: toLocalDateTime,
                toUtcString: toUtcString,
                removeTime: removeTime,
                toUtcDate: toUtcDate
            };

        }]);
})();