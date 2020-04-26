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

                function getAccountPhotos(id) {
                    return drbblyhttpService.get(api + 'getAccountPhotos/' + id);
                }

                function getAccountGames(id) {
                    return drbblyhttpService.get(api + 'getAccountGames/' + id);
                }

                function register(accountDetails) {
                    return drbblyhttpService.post(api + 'register', accountDetails);
                }

                function deletePhoto(accountId, photoId) {
                    return drbblyhttpService.post(api + 'deletePhoto/' + accountId + '/' + photoId);
                }

                function updateAccount(accountDetails) {
                    return drbblyhttpService.post(api + 'updateAccount', accountDetails);
                }

                function addAccountPhotos(files, accountId) {
                    var deferred = $q.defer();
                    drbblyFileService.upload(files, 'api/accounts/addAccountPhotos/' + accountId)
                        .then(function (result) {
                            deferred.resolve(result.data);
                        })
                        .catch(function (error) {
                            deferred.reject(error);
                        });

                    return deferred.promise;
                }

                var _service = {
                    addAccountPhotos: addAccountPhotos,
                    deletePhoto: deletePhoto,
                    getAllAccounts: getAllAccounts,
                    getAccount: getAccount,
                    getAccountByUsername: getAccountByUsername,
                    getAccountGames: getAccountGames,
                    getAccountPhotos: getAccountPhotos,
                    register: register,
                    updateAccount: updateAccount
                };

                return _service;
            }]);

})();