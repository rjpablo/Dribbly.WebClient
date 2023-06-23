(function () {
    'use strict';

    angular.module('mainModule')
        .service('drbblyTimerhelperService', [function () {

            function breakupDuration(duration) {
                var min = Math.floor(duration / 60000);
                var sec = Math.floor((duration % 60000) / 1000);
                var ms = (duration % 1000);
                var formatted = '';
                if (min > 0) {
                    formatted += `${min.toString().padStart(2, '0')}:`;
                }
                formatted += `${sec.toString().padStart(2, '0')}`;
                if (min === '0') {
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