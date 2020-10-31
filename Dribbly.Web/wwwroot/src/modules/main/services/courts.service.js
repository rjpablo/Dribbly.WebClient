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

                function getCodeReviewModal(id) {
                    return drbblyhttpService.get(api + 'getCodeReviewModal/' + id);
                }

                function getCourtPhotos(id) {
                    return drbblyhttpService.get(api + 'getCourtPhotos/' + id);
                }

                function getReviews(id) {
                    return drbblyhttpService.get(api + 'getReviews/' + id);
                }

                function getCourtVideos(id) {
                    return drbblyhttpService.get(api + 'getCourtVideos/' + id);
                }

                function getCourtGames(id) {
                    return drbblyhttpService.get(api + 'getCourtGames/' + id);
                }

                function getCourtBookings(id) {
                    return drbblyhttpService.get(api + 'getCourtBookings/' + id);
                }

                function followCourt(courtId, isFollowing) {
                    return drbblyhttpService.post(api + 'followCourt/' + courtId + '/' + isFollowing);
                }

                function register(courtDetails) {
                    return drbblyhttpService.post(api + 'register', courtDetails);
                }

                function submitReview(reviewDetails) {
                    return drbblyhttpService.post(api + 'submitReview', reviewDetails);
                }

                function deleteCourtVideo(courtId, videoId) {
                    return drbblyhttpService.post(api + 'deleteCourtVideo/' + courtId + '/' + videoId);
                }

                function deletePhoto(courtId, photoId) {
                    return drbblyhttpService.post(api + 'deletePhoto/' + courtId + '/' + photoId);
                }

                function FindCourts(searchInput) {
                    return drbblyhttpService.post(api + 'FindCourts', searchInput);
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

                function addCourtVideo(courtId, video, file) {
                    return drbblyFileService.upload(file, 'api/courts/addCourtVideo/' + courtId, video);
                }

                var _service = {
                    addCourtPhotos: addCourtPhotos,
                    addCourtVideo: addCourtVideo,
                    deleteCourtVideo: deleteCourtVideo,
                    deletePhoto: deletePhoto,
                    FindCourts: FindCourts,
                    followCourt: followCourt,
                    getAllCourts: getAllCourts,
                    getCodeReviewModal: getCodeReviewModal,
                    getCourt: getCourt,
                    getCourtBookings: getCourtBookings,
                    getCourtGames: getCourtGames,
                    getCourtPhotos: getCourtPhotos,
                    getReviews: getReviews,
                    getCourtVideos: getCourtVideos,
                    register: register,
                    submitReview: submitReview,
                    updateCourt: updateCourt
                };

                return _service;
            }]);

})();