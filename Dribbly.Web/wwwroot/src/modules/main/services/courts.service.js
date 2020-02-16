(function () {
    'use strict';

    angular.module('mainModule')
        .service('drbblyCourtsService', ['drbblyhttpService', function (drbblyhttpService) {
            var api = 'api/courts/';

            function getAllCourts() {
                return drbblyhttpService.get(api + 'getAllCourts');
            }

            function getCourt(id) {
                return drbblyhttpService.get(api + 'getCourt/' + id);
            }

            function getCourtPhotos(id) {
                return drbblyhttpService.get(api + 'getCourtPhotos/' + id);
            }

            function register(courtDetails) {
                return drbblyhttpService.post(api + 'register', courtDetails);
            }

            function updateCourt(courtDetails) {
                return drbblyhttpService.post(api + 'updateCourt', courtDetails);
            }

            var _service = {
                getAllCourts: getAllCourts,
                getCourt: getCourt,
                getCourtPhotos: getCourtPhotos,
                register: register,
                updateCourt: updateCourt
            };

            return _service;
        }]);

})();