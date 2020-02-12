(function () {
    'use strict';

    angular.module('siteModule')
        .filter('i18n', ['i18nService',
            function (i18nService) {
                var i18nFilter = function (input, subs, options) {
                    return i18nService.getString(input, subs, options);
                };

                return i18nFilter;
            }
        ]);
})();