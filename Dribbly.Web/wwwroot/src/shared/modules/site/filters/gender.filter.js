(function () {
    'use strict';

    angular.module('siteModule')
        .filter('gender', ['i18nService',
            function (i18nService) {
                return function (input) {
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
            }
        ]);
})();