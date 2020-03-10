(function () {
    'use strict';

    angular.module('mainModule')
        .service('drbblyCourtsService', ['drbblyhttpService', 'drbblyFileService', '$q',
            function (drbblyhttpService, drbblyFileService, $q) {
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

                function getCourtGames(id) {
                    return drbblyhttpService.get(api + 'getCourtGames/' + id);
                }

                function register(courtDetails) {
                    return drbblyhttpService.post(api + 'register', courtDetails);
                }

                function deletePhoto(courtId, photoId) {
                    return drbblyhttpService.post(api + 'deletePhoto/' + courtId + '/' + photoId);
                }

                function updateCourt(courtDetails) {
                    return drbblyhttpService.post(api + 'updateCourt', courtDetails);
                }

                function addCourtPhotos(files, courtId) {
                    var deferred = $q.defer();
                    drbblyFileService.upload(files, 'api/courts/addCourtPhotos/' + courtId)
                        .then(function (result) {
                            deferred.resolve(result.data);
                        })
                        .catch(function (error) {
                            deferred.reject(error);
                        });

                    return deferred.promise;
                }

                var _service = {
                    addCourtPhotos: addCourtPhotos,
                    deletePhoto: deletePhoto,
                    getAllCourts: getAllCourts,
                    getCourt: getCourt,
                    getCourtGames: getCourtGames,
                    getCourtPhotos: getCourtPhotos,
                    register: register,
                    updateCourt: updateCourt
                };

                return _service;
            }]);

})();