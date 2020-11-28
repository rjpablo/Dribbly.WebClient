(function () {
    'use strict';

    angular.module('mainModule')
        .service('drbblyTeamsService', ['drbblyhttpService', 'drbblyFileService', '$q',
            function (drbblyhttpService, drbblyFileService, $q) {
                var api = 'api/Teams/';

                function getAllTeams() {
                    return drbblyhttpService.get(api + 'getAllTeams');
                }

                function getTeam(id) {
                    return drbblyhttpService.get(api + 'getTeam/' + id);
                }

                function getTeamDetailsModal(id) {
                    return drbblyhttpService.get(api + 'getTeamDetailsModal/' + id);
                }

                function getTeamByUsername(username) {
                    return drbblyhttpService.get(api + 'getTeamByUsername/' + username);
                }

                function getTeamViewerData(username) {
                    return drbblyhttpService.get(api + 'getTeamViewerData/' + username);
                }

                function getTeamPhotos(teamId) {
                    return drbblyhttpService.get(api + 'getTeamPhotos/' + teamId);
                }

                function getTeamGames(id) {
                    return drbblyhttpService.get(api + 'getTeamGames/' + id);
                }

                function getTeamBookings(id) {
                    return drbblyhttpService.get(api + 'getTeamBookings/' + id);
                }

                function getTeamSettings(userId) {
                    return drbblyhttpService.get(api + 'getTeamSettings/' + userId);
                }

                function getTeamVideos(teamId) {
                    return drbblyhttpService.get(api + 'getTeamVideos/' + teamId);
                }

                function getTeamDropDownSuggestions(input) {
                    return drbblyhttpService.post(api + 'getTeamDropDownSuggestions', input);
                }

                function addTeam(teamDetails) {
                    return drbblyhttpService.post(api + 'addTeam', teamDetails);
                }

                function deletePhoto(photoId, teamId) {
                    return drbblyhttpService.post(api + 'deletePhoto/' + photoId + '/' + teamId);
                }

                function updateTeam(teamDetails) {
                    return drbblyhttpService.post(api + 'updateTeam', teamDetails);
                }

                function addTeamPhotos(files, teamId) {
                    var deferred = $q.defer();
                    drbblyFileService.upload(files, api + 'addTeamPhotos/' + teamId)
                        .then(function (result) {
                            deferred.resolve(result.data);
                        }, function (error) {
                            deferred.reject(error);
                        });

                    return deferred.promise;
                }

                function addTeamVideo(teamId, video, file) {
                    return drbblyFileService.upload(file, api + 'addTeamVideo/' + teamId, video);
                }

                function setStatus(teamId, status) {
                    return drbblyhttpService.post(api + 'setStatus/' + teamId + '/' + status);
                }

                function setIsPublic(userId, isPublic) {
                    return drbblyhttpService.post(api + 'setIsPublic/' + userId + '/' + isPublic);
                }

                var _service = {
                    addTeam: addTeam,
                    addTeamPhotos: addTeamPhotos,
                    addTeamVideo: addTeamVideo,
                    deletePhoto: deletePhoto,
                    getAllTeams: getAllTeams,
                    getTeam: getTeam,
                    getTeamByUsername: getTeamByUsername,
                    getTeamDetailsModal: getTeamDetailsModal,
                    getTeamDropDownSuggestions: getTeamDropDownSuggestions,
                    getTeamGames: getTeamGames,
                    getTeamBookings: getTeamBookings,
                    getTeamPhotos: getTeamPhotos,
                    getTeamSettings: getTeamSettings,
                    getTeamVideos: getTeamVideos,
                    getTeamViewerData: getTeamViewerData,
                    setIsPublic: setIsPublic,
                    setStatus: setStatus,
                    updateTeam: updateTeam
                };

                return _service;
            }]);

})();