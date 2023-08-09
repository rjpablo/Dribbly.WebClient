(function () {
    'use strict';

    angular.module('mainModule')
        .service('drbblyTeamsService', ['drbblyhttpService', 'drbblyFileService', '$q',
            function (drbblyhttpService, drbblyFileService, $q) {
                var api = 'api/Teams/';

                //GETs

                function getAllTeams() {
                    return drbblyhttpService.get(api + 'getAllTeams');
                }

                function getUserTeamRelation(teamId) {
                    return drbblyhttpService.get(api + 'getUserTeamRelation/' + teamId);
                }

                function getCurrentMembers(teamId) {
                    return drbblyhttpService.get(api + 'getCurrentMembers/' + teamId);
                }

                function getTopPlayers(teamId) {
                    return drbblyhttpService.get(api + 'getTopPlayers/' + teamId);
                }

                function getJoinRequests(teamId) {
                    return drbblyhttpService.get(api + 'getJoinRequests/' + teamId);
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

                function getManagedTeamsAsChoices() {
                    return drbblyhttpService.get(api + 'getManagedTeamsAsChoices');
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

                //POSTs

                function getTeamDropDownSuggestions(input) {
                    return drbblyhttpService.post(api + 'getTeamDropDownSuggestions', input);
                }

                function getTopTeams(input) {
                    return drbblyhttpService.post(api + 'getTopTeams', input);
                }

                function addTeam(teamDetails) {
                    return drbblyhttpService.post(api + 'addTeam', teamDetails);
                }

                function deletePhoto(photoId, teamId) {
                    return drbblyhttpService.post(api + 'deletePhoto/' + photoId + '/' + teamId);
                }

                function cancelJoinRequest(teamId) {
                    return drbblyhttpService.post(api + 'cancelJoinRequest/' + teamId);
                }

                function leaveTeam(teamId) {
                    return drbblyhttpService.post(api + 'leaveTeam/' + teamId);
                }

                function joinTeam(request) {
                    return drbblyhttpService.post(api + 'joinTeam', request);
                }

                function processJoinRequest(input) {
                    return drbblyhttpService.post(api + 'processJoinRequest', input);
                }

                function removeMember(teamId, membershipId) {
                    return drbblyhttpService.post(api + 'removeMember/' + teamId + '/' + membershipId);
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
                    cancelJoinRequest: cancelJoinRequest,
                    deletePhoto: deletePhoto,
                    getAllTeams: getAllTeams,
                    getCurrentMembers: getCurrentMembers,
                    getJoinRequests: getJoinRequests,
                    getManagedTeamsAsChoices: getManagedTeamsAsChoices,
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
                    getTopPlayers: getTopPlayers,
                    getTopTeams: getTopTeams,
                    getUserTeamRelation: getUserTeamRelation,
                    joinTeam: joinTeam,
                    leaveTeam: leaveTeam,
                    processJoinRequest: processJoinRequest,
                    removeMember: removeMember,
                    setIsPublic: setIsPublic,
                    setStatus: setStatus,
                    updateTeam: updateTeam
                };

                return _service;
            }]);

})();