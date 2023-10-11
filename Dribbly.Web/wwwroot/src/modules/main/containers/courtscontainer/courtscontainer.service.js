(function () {
    'use strict';

    angular.module('mainModule')
        .service('courtsService', ['drbblyhttpService', function (drbblyhttpService) {
            var _controller = 'api/courts/';
            return {
                getAllCourts: () => drbblyhttpService.get(_controller + 'getAllCourts')
            };
        }]);
})();