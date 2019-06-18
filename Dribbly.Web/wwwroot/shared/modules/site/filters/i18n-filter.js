(function () {
    'use strict';

    angular.module('siteModule')
        .filter('i18n', ['i18nService',
            function (i18nService) {
                var i18nFilter = function (key) {
                    return i18nService.getValue(key);
                };

                return i18nFilter;
            }
        ]);
})();