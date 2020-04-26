(function () {
    'use strict';

    angular.module('siteModule')
        .filter('sex', ['i18nService',
            function (i18nService) {
                var sexFilter = function (input) {
                    var key;
                    if (input === 0) {
                        key = 'app.Male';
                    }
                    else if (input === 1) {
                        key = 'app.Female';
                    }
                    else {
                        key = 'app.Unspecified';
                    }

                    return i18nService.getString(key);
                };

                return sexFilter;
            }
        ]);
})();