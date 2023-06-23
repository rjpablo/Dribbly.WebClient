(function () {
    'use strict';

    angular.module('mainModule')
        .service('drbblyTimerhelperService', [function () {

            function breakupDuration(duration, forShotClock) {
                var min = forShotClock ? 0 : Math.floor(duration / 60000);
                var sec = forShotClock ?
                    Math.ceil((duration % 60000) / 1000) : // use the ceiling for shot clock, because we don't show ms
                    Math.floor((duration % 60000) / 1000);
                var ms = forShotClock ? 0 : (duration % 1000);
                var formatted = '';
                if (min > 0 && !forShotClock) {
                    formatted += `${min.toString().padStart(2, '0')}:`;
                }
                formatted += `${sec.toString().padStart(2, '0')}`;
                if (min === '0' && !forShotClock) {
                    formatted += `.${ms.toString()}`;
                }

                return {
                    min: min,
                    sec: sec,
                    ms: ms,
                    formattedTime: formatted
                }
            }

            function getMsDuration(min, sec, ms) {
                var totalMs = ms + (sec * 1000) + (min * 60 * 1000);
                return totalMs;
            }

            var _service = {
                breakupDuration: breakupDuration,
                getMsDuration: getMsDuration
            };

            return _service;
        }]);

})();