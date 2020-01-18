(function () {
    'use strict';

    angular.module('mainModule')
        .service('drbblyCourtsService', ['drbblyhttpService', function (drbblyhttpService) {
            var api = 'api/courts/';

            function register(courtDetails) {
                return drbblyhttpService.post(api + 'register', courtDetails);
            }

            function getAllCourts() {
                return drbblyhttpService.post(api + 'getAllCourts', courtDetails);
            }

            var _service = {
                getAllCourts: getAllCourts,
                register: register
            };

            return _service;
        }]);

})();