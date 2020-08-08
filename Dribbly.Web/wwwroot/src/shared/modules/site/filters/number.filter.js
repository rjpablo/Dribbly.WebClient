(function () {
    'use strict';

    angular.module('siteModule')
        .filter('drbblyNumber', function () {
            return function (input, digits) {
                // no need to format if less than 1k
                if (input < 1000) return input;

                var units = ['', 'k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];
                var floor = Math.floor(Math.abs(input).toString().length / 3);
                var value = +(input / Math.pow(1000, floor));
                return value.toFixed(digits ? digits : 1)
                    .replace(/^([\d,]+)$|^([\d,]+)\.0*$|^([\d,]+\.[0-9]*?)0*$/, "$1$2$3") + units[floor];
            };
        });
})();