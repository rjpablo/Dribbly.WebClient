(function () {
    'use strict';

    angular.module('appModule')
        .filter('height', ['i18nService',
            function (i18nService) {
                var filter = function (input) {
                    if (input) {
                        var feet = Math.floor(input / 12);
                        var inches = input % 12;

                        return feet + '\' ' + inches + '"';
                    }
                    else {
                        return i18nService.getString('app.Unspecified');
                    }
                };

                return filter;
            }
        ]);
})();