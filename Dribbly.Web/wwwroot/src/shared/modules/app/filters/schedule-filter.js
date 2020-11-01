(function () {
    'use strict';

    angular.module('appModule')
        .filter('drbblyschedule', ['i18nService', 'settingsService', 'drbblydateFilter',
            function (i18nService, settingsService, drbblydateFilter) {
                var filter = function (input) {
					var start = input.start;
                    var end = input.end;
                    var result;

                    if (!start) {
                        result = i18nService.getString('site.NotSet');
                    }
                    else {
                        result = drbblydateFilter(start);
                        if (end) {
                            result += ' - ' + drbblydateFilter(end, settingsService.defaultTimeFormat);
                        }
                    }
                    return result;
                };

                return filter;
            }
        ]);
})();