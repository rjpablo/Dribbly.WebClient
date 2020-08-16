(function () {
    'use strict';

    angular.module('mainModule')
        .service('drbblyAccountsService', ['drbblyhttpService', 'drbblyFileService', '$q',
            function (drbblyhttpService, drbblyFileService, $q) {
                var api = 'api/account/';

                function getAllAccounts() {
                    return drbblyhttpService.get(api + 'getAllAccounts');
                }

                function getAccount(id) {
                    return drbblyhttpService.get(api + 'getAccount/' + id);
                }

                function getAccountByUsername(username) {
                    return drbblyhttpService.get(api + 'getAccountByUsername/' + username);
                }

                function getAccountPhotos(accountId) {
                    return drbblyhttpService.get(api + 'getAccountPhotos/' + accountId);
                }

                function getAccountGames(id) {
                    return drbblyhttpService.get(api + 'getAccountGames/' + id);
                }

                function getAccountSettings(userId) {
                    return drbblyhttpService.get(api + 'getAccountSettings/' + userId);
                }

                function getAccountVideos(accountId) {
                    return drbblyhttpService.get(api + 'getAccountVideos/' + accountId);
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

                function addAccountVideo(accountId, video, file) {
                    return drbblyFileService.upload(file, api + 'addAccountVideo/' + accountId, video);
                }

                function setStatus(accountId, status) {
                    return drbblyhttpService.post(api + 'setStatus/' + accountId + '/' + status);
                }

                function setIsPublic(userId, isPublic) {
                    return drbblyhttpService.post(api + 'setIsPublic/' + userId + '/' + isPublic);
                }

                var _service = {
                    addAccountPhotos: addAccountPhotos,
                    addAccountVideo: addAccountVideo,
                    deletePhoto: deletePhoto,
                    getAllAccounts: getAllAccounts,
                    getAccount: getAccount,
                    getAccountByUsername: getAccountByUsername,
                    getAccountDropDownSuggestions: getAccountDropDownSuggestions,
                    getAccountGames: getAccountGames,
                    getAccountPhotos: getAccountPhotos,
                    getAccountSettings: getAccountSettings,
                    getAccountVideos: getAccountVideos,
                    register: register,
                    setIsPublic: setIsPublic,
                    setStatus: setStatus,
                    updateAccount: updateAccount
                };

                return _service;
            }]);

})();