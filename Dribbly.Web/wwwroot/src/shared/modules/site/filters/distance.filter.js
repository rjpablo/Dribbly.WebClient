(function () {
    'use strict';
    angular.module('siteModule')
        .filter('drbblyDistance', ['i18nService', function (i18nService) {
            /**
             * Appends unit to distance
             * @param {number} input distance in kilometers
             * @returns {string} distance in kilometer with unit
             */
            function filterFn(input) {
                return input.toFixed(2) + ' ' + i18nService.getString('site.Km');
            }

            return filterFn;
        }]);
})();