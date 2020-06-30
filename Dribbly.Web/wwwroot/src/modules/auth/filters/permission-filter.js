(function () {
    'use strict';

    angular.module('authModule')
        .filter('drbblyPermission', ['permissionsService',
            function (permissionsService) {
                return function (input) {
                    return permissionsService.hasPermission(input);
                };
            }
        ]);
})();