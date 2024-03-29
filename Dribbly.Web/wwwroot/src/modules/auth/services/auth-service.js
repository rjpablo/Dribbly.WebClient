﻿(function () {
    'use strict';

    angular.module('authModule')
        .factory('authService', serviceFn);

    serviceFn.$inject = ['$http', '$q', 'localStorageService', 'settingsService', '$state', '$location', 'modalService',
        'permissionsService', 'drbblyEventsService', 'constants'];
    function serviceFn($http, $q, localStorageService, settingsService, $state, $location, modalService,
        permissionsService, drbblyEventsService, constants) {

        var authServiceFactory = {};
        var _useRefreshTokens = true;
        var _temporaryProfilePicture = constants.images.defaultProfilePhoto.url;
        var _authQueue = [];
        var _authVerified;

        var _authentication = {
            isAuthenticated: false,
            username: ""
        };

        var signUp = function (registration) {

            _logOut();

            return $http.post(settingsService.serviceBase + 'api/account/register', registration);

        };

        var _login = function (loginData) {

            var data = 'grant_type=password&username=' + loginData.username + '&password=' + loginData.password +
                '&client_id=' + settingsService.clientId;

            var deferred = $q.defer();

            $http.post(settingsService.serviceBase + 'token', data, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
                .then(function (response) {
                    permissionsService.getUserPermissionNames(response.data.userId)
                        .then(function (data) {

                            localStorageService.set('authorizationData', {
                                token: response.data.access_token,
                                username: loginData.username,
                                userId: parseInt(response.data.userId),
                                accountId: parseInt(response.data.accountId),
                                refreshToken: response.data.refresh_token,
                                useRefreshTokens: _useRefreshTokens,
                                profilePicture: response.data.profilePicture || _temporaryProfilePicture,
                                permissions: data
                            });

                            _authentication.isAuthenticated = true;
                            _authentication.username = loginData.username;
                            _authentication.useRefreshTokens = _useRefreshTokens;
                            _authentication.profilePicture = response.data.profilePicture || _temporaryProfilePicture;
                            _authentication.userId = parseInt(response.data.userId);
                            _authentication.accountId = parseInt(response.data.accountId);

                            deferred.resolve(response);

                            drbblyEventsService.broadcast('dribbly.login.successful');

                        })
                        .catch(function (error) {
                            _logOut();
                            deferred.resolve(response);
                        });

                }).catch(function (err, status) {
                    _logOut();
                    deferred.reject(err.data);
                });

            return deferred.promise;

        };

        function showLoginModal() {
            return modalService.show({
                view: '<drbbly-loginmodal></drbbly-loginmodal>',
                model: {
                    messageKey: 'auth.PleaseLogInToProceed'
                },
                backdrop: 'static',
                isFull: false
            });
        }

        var _logOut = function () {

            localStorageService.remove('authorizationData');

            _authentication.isAuthenticated = false;
            _authentication.username = '';
            _authentication.userId = null;
            _authentication.accountId = null;
            _authentication.profilePicture = null;
            permissionsService.setPermissions([]);

        };

        var _sendResetPasswordLink = function (model) {
            return $http.post(settingsService.serviceBase + 'api/account/sendPasswordResetLink', model);
        };

        function resetPassword(input) {
            return $http.post(settingsService.serviceBase + 'api/account/resetPassword', input);
        }

        var _fillAuthData = function () {

            var authData = localStorageService.get('authorizationData');
            if (authData) {
                _authentication.isAuthenticated = true;
                _authentication.username = authData.username;
                _authentication.useRefreshTokens = authData.useRefreshTokens;
                _authentication.profilePicture = authData.profilePicture;
                _authentication.userId = parseInt(authData.userId);
                _authentication.accountId = parseInt(authData.accountId);
                permissionsService.setPermissions(authData.permissions);
            }

        };

        function showChangePasswordModal() {
            return modalService.show({
                view: '<drbbly-changepasswordmodal></drbbly-changepasswordmodal>',
                model: {}
            });
        }

        function changePassword(model) {
            var deferred = $q.defer();
            $http.post(settingsService.serviceBase + 'api/account/changePassword', model)
                .then(function (result) {
                    deferred.resolve(result.data);
                })
                .catch(function (error) {
                    deferred.reject(error);
                });
            return deferred.promise;
        }

        var _refreshToken = function () {
            var deferred = $q.defer();

            var authData = localStorageService.get('authorizationData');
            localStorageService.remove('authorizationData');

            if ((authData && authData.useRefreshTokens) || _authQueue.length > 0) {
                if (_authQueue.length === 0) {
                    var data = 'grant_type=refresh_token&refresh_token=' + authData.refreshToken + '&client_id=' + settingsService.clientId;

                    $http.post(settingsService.serviceBase + 'token', data, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, isRefreshToken: true })
                        .then(function (response) {
                            localStorageService.set('authorizationData', {
                                token: response.data.access_token,
                                username: response.data.username,
                                userId: parseInt(response.data.userId),
                                accountId: parseInt(response.data.accountId),
                                refreshToken: response.data.refresh_token,
                                useRefreshTokens: _useRefreshTokens,
                                profilePicture: response.data.profilePicture || _temporaryProfilePicture,
                                permissions: authData.permissions
                            });

                            _authentication.isAuthenticated = true;
                            _authentication.username = response.data.username;
                            _authentication.useRefreshTokens = _useRefreshTokens;
                            _authentication.profilePicture = response.data.profilePicture || _temporaryProfilePicture;
                            _authentication.userId = parseInt(response.data.userId);
                            _authentication.accountId = parseInt(response.data.accountId);
                            permissionsService.setPermissions(authData.permissions);

                            while (_authQueue.length > 0) {
                                var d = _authQueue[0];
                                d.resolve(response);
                                _authQueue.drbblyRemove(d);
                            }
                        })
                        .catch(function (err, status) {
                            _logOut();
                            while (_authQueue.length > 0) {
                                var d = _authQueue[0];
                                d.reject(err);
                                _authQueue.drbblyRemove(d);
                            }
                        });
                }
                _authQueue.push(deferred);
            }
            else {
                deferred.reject();
            }

            return deferred.promise;

        };

        function isAuthVerified() {
            return _authVerified;
        }

        function _loginExternal(provider) {
            var redirectUri = settingsService.siteRoot + '#/login';
            var externalProviderUrl = settingsService.serviceBase + "api/Account/ExternalLogin?provider=" + provider + "&response_type=token&client_id=" + settingsService.clientId + "&redirect_uri=" + redirectUri;
            window.location.href = externalProviderUrl;
        }

        async function _verifyToken() {
            var authData = localStorageService.get('authorizationData');
            if (authData) {
                await $http.post(settingsService.serviceBase + 'api/account/verifyToken', null, { triggersLogin: false })
                    .then(function () {
                        _fillAuthData();
                    })
                    .catch(function () {
                        _logOut();
                    })
                    .finally(() => {
                        _authVerified = true;
                        drbblyEventsService.broadcast('dribbly.auth.verified');
                    });
            }
            else {
                _authVerified = true;
                drbblyEventsService.broadcast('dribbly.auth.verified');
            }
        }

        var _registerExternal = function (registerExternalData) {

            var deferred = $q.defer();

            $http.post(settingsService.serviceBase + 'api/account/registerexternal', registerExternalData)
                .then(function (response) {

                    localStorageService.set('authorizationData', {
                        token: response.data.access_token,
                        username: registerExternalData.username,
                        userId: parseInt(response.data.userId),
                        accountId: parseInt(response.data.accountId),
                        refreshToken: response.data.refresh_token,
                        profilePicture: response.data.profilePicture || _temporaryProfilePicture,
                        useRefreshTokens: _useRefreshTokens
                    });

                    _authentication.isAuthenticated = true;
                    _authentication.username = registerExternalData.username;
                    _authentication.useRefreshTokens = _useRefreshTokens;
                    _authentication.userId = parseInt(response.data.userId);
                    _authentication.accountId = parseInt(response.data.accountId);
                    _authentication.profilePicture = response.data.profilePicture || _temporaryProfilePicture;

                    deferred.resolve(response);
                    drbblyEventsService.broadcast('dribbly.login.successful');

                })
                .catch(function (err) {
                    _logOut();
                    deferred.reject(err);
                });

            return deferred.promise;

        };

        var _obtainAccessToken = function (externalData) {

            var deferred = $q.defer();

            $http.get(settingsService.serviceBase + 'api/account/ObtainLocalAccessToken?provider=' + externalData.provider +
                '&externalAccessToken=' + externalData.externalAccessToken)
                .then(function (response) {

                    localStorageService.set('authorizationData', {
                        token: response.data.access_token,
                        username: response.data.username,
                        userId: parseInt(response.data.userId),
                        accountId: parseInt(response.data.accountId),
                        refreshToken: response.data.refresh_token,
                        profilePicture: response.data.profilePicture || _temporaryProfilePicture,
                        useRefreshTokens: _useRefreshTokens
                    });

                    _authentication.isAuthenticated = true;
                    _authentication.username = response.data.username;
                    _authentication.useRefreshTokens = _useRefreshTokens;
                    _authentication.userId = parseInt(response.data.userId);
                    _authentication.accountId = parseInt(response.data.accountId);
                    _authentication.profilePicture = response.data.profilePicture || _temporaryProfilePicture;

                    deferred.resolve(response);
                    if (response.data.hasRegistered) {
                        drbblyEventsService.broadcast('dribbly.login.successful');
                    }

                }).catch(function (err) {
                    _logOut();
                    deferred.reject(err);
                });

            return deferred.promise;

        };

        var _checkAuthentication = function () {
            var deferred = $q.defer();

            if (!(_authentication && _authentication.isAuthenticated) || _authQueue.length > 0) {
                _refreshToken()
                    .then(function () {
                        deferred.resolve();
                    }, function (err) {
                        showLoginModal()
                            .then(deferred.resolve, deferred.reject);
                    });
            }
            else {
                deferred.resolve();
            }

            return deferred.promise;
        };

        function _checkAuthenticationThen(cb) {
            var deferred = $q.defer();
            _checkAuthentication()
                .then(function () {
                    var cbResult = cb();
                    if (cbResult && cbResult.then) {
                        cbResult.then(function (res) {
                            deferred.resolve(res);
                        }, function (error) {
                            deferred.reject(error);
                        });
                    }
                    else {
                        deferred.resolve();
                    }
                })
                .catch(deferred.reject);
            return deferred.promise;
        }

        function _isCurrentUserId(id) {
            return _authentication.userId && _authentication.userId === id;
        }

        function _isCurrentAccountId(id) {
            return _authentication.accountId && _authentication.accountId === id;
        }

        //TEST FUNCTIONALITY ONLY
        var _test = function () {
            $http.post(settingsService.serviceBase + 'api/account/test')
                .then(function () { alert('Test successful!'); })
                .catch(function () { alert('Test failed!'); });
        };

        authServiceFactory.changePassword = changePassword;
        authServiceFactory.checkAuthenticationThen = _checkAuthenticationThen;
        authServiceFactory.checkAuthentication = _checkAuthentication;
        authServiceFactory.isCurrentUserId = _isCurrentUserId;
        authServiceFactory.isCurrentAccountId = _isCurrentAccountId;
        authServiceFactory.signUp = signUp;
        authServiceFactory.login = _login;
        authServiceFactory.logOut = _logOut;
        authServiceFactory.fillAuthData = _fillAuthData;
        authServiceFactory.verifyToken = _verifyToken;
        authServiceFactory.isAuthVerified = isAuthVerified;
        authServiceFactory.authentication = _authentication;
        authServiceFactory.refreshToken = _refreshToken;
        authServiceFactory.test = _test;
        authServiceFactory.loginExternal = _loginExternal;
        authServiceFactory.registerExternal = _registerExternal;
        authServiceFactory.sendResetPasswordLink = _sendResetPasswordLink;
        authServiceFactory.showChangePasswordModal = showChangePasswordModal;
        authServiceFactory.showLoginModal = showLoginModal;
        authServiceFactory.obtainAccessToken = _obtainAccessToken;
        authServiceFactory.resetPassword = resetPassword;

        return authServiceFactory;
    }
})();
