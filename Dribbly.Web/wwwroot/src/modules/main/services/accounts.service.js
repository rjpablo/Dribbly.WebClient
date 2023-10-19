(function () {
    'use strict';

    angular.module('mainModule')
        .service('drbblyAccountsService', ['drbblyhttpService', 'drbblyFileService', '$q',
            function (drbblyhttpService, drbblyFileService, $q) {
                var api = 'api/account/';

                function getAllAccounts() {
                    return drbblyhttpService.get(api + 'getAllAccounts');
                }

                function getTopPlayers() {
                    return drbblyhttpService.get(api + 'getTopPlayers');
                }

                function getPlayers(input) {
                    return drbblyhttpService.post(api + 'getPlayers', input);
                }

                function getAccount(id) {
                    return drbblyhttpService.get(api + 'getAccount/' + id);
                }

                function getAccountDetailsModal(id) {
                    return drbblyhttpService.get(api + 'getAccountDetailsModal/' + id);
                }

                function getAccountByUsername(username) {
                    return drbblyhttpService.get(api + 'getAccountByUsername/' + username);
                }

                function getAccountViewerData(username) {
                    return drbblyhttpService.get(api + 'getAccountViewerData/' + username);
                }

                function getAccountPhotos(accountId) {
                    return drbblyhttpService.get(api + 'getAccountPhotos/' + accountId);
                }

                function getAccountGames(id) {
                    return drbblyhttpService.get(api + 'getAccountGames/' + id);
                }

                function getAccountBookings(id) {
                    return drbblyhttpService.get(api + 'getAccountBookings/' + id);
                }

                function getAccountSettings(userId) {
                    return drbblyhttpService.get(api + 'getAccountSettings/' + userId);
                }

                function getAccountVideos(accountId) {
                    return drbblyhttpService.get(api + 'getAccountVideos/' + accountId);
                }

                function getPlayerGames(accountId) {
                    return drbblyhttpService.get(api + 'getPlayerGames/' + accountId);
                }

                function getAccountDropDownSuggestions(input) {
                    return drbblyhttpService.post(api + 'getAccountDropDownSuggestions', input);
                }

                function register(accountDetails) {
                    return drbblyhttpService.post(api + 'register', accountDetails);
                }

                function deletePhoto(photoId, accountId) {
                    return drbblyhttpService.post(api + 'deletePhoto/' + photoId + '/' + accountId);
                }

                function updateAccount(accountDetails) {
                    return drbblyhttpService.post(api + 'updateAccount', accountDetails);
                }

                function addAccountPhotos(files, accountId) {
                    var deferred = $q.defer();
                    drbblyFileService.upload(files, api + 'addAccountPhotos/' + accountId)
                        .then(function (result) {
                            deferred.resolve(result.data);
                        }, function (error) {
                            deferred.reject(error);
                        });

                    return deferred.promise;
                }

                function addAccountVideo(accountId, video, file, addToHighlights) {
                    return drbblyFileService.upload([file], api + 'addAccountVideo/' + accountId + '/' + !!addToHighlights, video);
                }

                function setStatus(accountId, status) {
                    return drbblyhttpService.post(api + 'setStatus/' + accountId + '/' + status);
                }

                function setHomeCourt(courtId) {
                    return drbblyhttpService.post(api + 'setHomeCourt/' + courtId);
                }

                function removeFlag(key) {
                    return drbblyhttpService.post(api + 'removeFlag/' + key);
                }

                function replaceEmail(input) {
                    return drbblyhttpService.post(api + 'replaceEmail', input);
                }

                function removeHighlight(fileId) {
                    return drbblyhttpService.post(api + 'removeHighlight/' + fileId);
                }

                function deleteVideo(videoId) {
                    return drbblyhttpService.post(api + 'deleteVideo/' + videoId);
                }

                function setIsPublic(userId, isPublic) {
                    return drbblyhttpService.post(api + 'setIsPublic/' + userId + '/' + isPublic);
                }

                var _service = {
                    addAccountPhotos: addAccountPhotos,
                    addAccountVideo: addAccountVideo,
                    deletePhoto: deletePhoto,
                    deleteVideo: deleteVideo,
                    getAllAccounts: getAllAccounts,
                    getAccount: getAccount,
                    getAccountByUsername: getAccountByUsername,
                    getAccountDetailsModal: getAccountDetailsModal,
                    getAccountDropDownSuggestions: getAccountDropDownSuggestions,
                    getAccountGames: getAccountGames,
                    getAccountBookings: getAccountBookings,
                    getAccountPhotos: getAccountPhotos,
                    getAccountSettings: getAccountSettings,
                    getAccountVideos: getAccountVideos,
                    getAccountViewerData: getAccountViewerData,
                    getPlayerGames: getPlayerGames,
                    getPlayers: getPlayers,
                    getTopPlayers: getTopPlayers,
                    register: register,
                    removeFlag,
                    removeHighlight: removeHighlight,
                    replaceEmail: replaceEmail,
                    setIsPublic: setIsPublic,
                    setHomeCourt,
                    setStatus: setStatus,
                    updateAccount: updateAccount
                };

                return _service;
            }]);

})();