(function () {
    'use strict';

    angular.module('authModule')
        .factory('authService', serviceFn);

    serviceFn.$inject = ['$http', '$q', 'localStorageService', 'settingsService', '$state', '$location', 'modalService',
        'permissionsService'];
    function serviceFn($http, $q, localStorageService, settingsService, $state, $location, modalService,
        permissionsService) {

        var authServiceFactory = {};
        var _useRefreshTokens = true;
        var _temporaryProfilePicture = 'https://i7.pngguru.com/preview/178/419/741/computer-icons-avatar-login-user-avatar.jpg';

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
                                userId: response.data.userId,
                                refreshToken: response.data.refresh_token,
                                useRefreshTokens: _useRefreshTokens,
                                profilePicture: _temporaryProfilePicture,
                                permissions: data
                            });

                            _authentication.isAuthenticated = true;
                            _authentication.username = loginData.username;
                            _authentication.useRefreshTokens = _useRefreshTokens;
                            _authentication.profilePicture = _temporaryProfilePicture;
                            _authentication.userId = response.data.userId;

                            deferred.resolve(response);

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

        var _logOut = function () {

            localStorageService.remove('authorizationData');

            _authentication.isAuthenticated = false;
            _authentication.username = "";
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
                _authentication.userId = authData.userId;
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

            if (authData && authData.useRefreshTokens) {

                var data = 'grant_type=refresh_token&refresh_token=' + authData.refreshToken + '&client_id=' + settingsService.clientId;

                $http.post(settingsService.serviceBase + 'token', data, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
                    .then(function (response) {
                        localStorageService.set('authorizationData', {
                            token: response.data.access_token,
                            username: response.data.userName,
                            userId: response.data.userId,
                            refreshToken: response.data.refresh_token,
                            useRefreshTokens: _useRefreshTokens,
                            profilePicture: _temporaryProfilePicture,
                            permissions: authData.permissions
                        });

                        _authentication.isAuthenticated = true;
                        _authentication.username = response.data.userName;
                        _authentication.useRefreshTokens = _useRefreshTokens;
                        _authentication.profilePicture = _temporaryProfilePicture;
                        _authentication.userId = response.data.userId;
                        permissionsService.setPermissions(authData.permissions);

                        deferred.resolve(response);
                    }).catch(function (err, status) {
                        _logOut();
                        deferred.reject(err);
                    });
            }
            else {
                deferred.reject();
            }

            return deferred.promise;
        };

        function _loginExternal(provider) {
            var redirectUri = settingsService.siteRoot + '#/login';
            var externalProviderUrl = settingsService.serviceBase + "api/Account/ExternalLogin?provider=" + provider + "&response_type=token&client_id=" + settingsService.clientId + "&redirect_uri=" + redirectUri;
            window.location.href = externalProviderUrl;
        }

        var _registerExternal = function (registerExternalData) {

            var deferred = $q.defer();

            $http.post(settingsService.serviceBase + 'api/account/registerexternal', registerExternalData)
                .then(function (response) {

                    localStorageService.set('authorizationData', {
                        token: response.data.access_token,
                        username: registerExternalData.username,
                        userId: response.data.userId,
                        refreshToken: response.data.refresh_token,
                        useRefreshTokens: _useRefreshTokens
                    });

                    _authentication.isAuthenticated = true;
                    _authentication.username = loginData.username;
                    _authentication.useRefreshTokens = _useRefreshTokens;
                    _authentication.userId = response.data.userId;

                    deferred.resolve(response);

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
                        username: response.data.userName,
                        userId: response.data.userId,
                        refreshToken: response.data.refresh_token,
                        useRefreshTokens: _useRefreshTokens
                    });

                    _authentication.isAuthenticated = true;
                    _authentication.username = response.data.userName;
                    _authentication.useRefreshTokens = _useRefreshTokens;
                    _authentication.userId = response.data.userId;

                    deferred.resolve(response);

                }).catch(function (err) {
                    _logOut();
                    deferred.reject(err);
                });

            return deferred.promise;

        };

        var _checkAuthentication = function () {
            var deferred = $q.defer();

            if (!(_authentication && _authentication.isAuthenticated)) {
                _refreshToken()
                    .then(function () {
                        deferred.resolve();
                    })
                    .catch(function () {
                        deferred.reject();
                        _redirectoToLogin();
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
                    cb()
                        .then(function (res) {
                            deferred.resolve(res);
                        })
                        .catch(function (error) {
                            deferred.reject(error);
                        });
                })
                .catch(deferred.reject);
            return deferred.promise;
        }

        function _redirectoToLogin() {
            var resumeUrl = $location.url();
            $state.go('auth.login', { resumeUrl: resumeUrl });
        }

        function _isCurrentUserId(id) {
            return _authentication && id && _authentication.userId === id;
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
        authServiceFactory.signUp = signUp;
        authServiceFactory.login = _login;
        authServiceFactory.logOut = _logOut;
        authServiceFactory.fillAuthData = _fillAuthData;
        authServiceFactory.authentication = _authentication;
        authServiceFactory.refreshToken = _refreshToken;
        authServiceFactory.test = _test;
        authServiceFactory.loginExternal = _loginExternal;
        authServiceFactory.registerExternal = _registerExternal;
        authServiceFactory.sendResetPasswordLink = _sendResetPasswordLink;
        authServiceFactory.showChangePasswordModal = showChangePasswordModal;
        authServiceFactory.obtainAccessToken = _obtainAccessToken;
        authServiceFactory.resetPassword = resetPassword;

        return authServiceFactory;
    }
})();
