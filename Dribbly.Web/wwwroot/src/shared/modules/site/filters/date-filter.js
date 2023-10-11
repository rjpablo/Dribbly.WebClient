(function () {
    'use strict';

    angular.module('siteModule')
        .filter('drbblydate', ['i18nService', '$filter', 'settingsService',
            function (i18nService, $filter, settingsService) {
                var filter = function (date, format) {
                    if (date) {
                        format = format || settingsService.defaultDateFormat;
                        return $filter('date')(date, format)
                    }
                    else {
                        return i18nService.getString('site.NotSet');
                    }
                };

                return filter;
            }
        ]);
})();