(function () {
    'use strict';

    angular.module('siteModule')
        .factory('authService', ['$http', '$q', 'localStorageService', function ($http, $q, localStorageService) {

            var serviceBase = 'https://localhost:44394/'; //use this when auth API is running in Visual Studio
            //var serviceBase = 'http://localhost:9020/'; //use this to auth API in local IIS server
            //var serviceBase = 'http://www.dribbly001.somee.com/'; //use somee test server
            var authServiceFactory = {};
            var _clientId = 'dribbly-web';
            var _clientSecret = '5YV7M1r981yoGhELyB84aC+KiYksxZf1OY3++C1CtRM=';
            var _useRefreshTokens = true;

            var _authentication = {
                isAuthenticated: false,
                userName: ""
            };

            var signUp = function (registration) {

                _logOut();

                return $http.post(serviceBase + 'api/account/register', registration);

            };

            var _login = function (loginData) {

                var data = 'grant_type=password&username=' + loginData.userName + '&password=' + loginData.password +
                    '&client_id=' + _clientId;

                var deferred = $q.defer();

                $http.post(serviceBase + 'token', data, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
                    .then(function (response) {

                        localStorageService.set('authorizationData', {
                            token: response.data.access_token,
                            userName: loginData.userName,
                            refreshToken: response.data.refresh_token,
                            useRefreshTokens: _useRefreshTokens
                        });

                        _authentication.isAuthenticated = true;
                        _authentication.userName = loginData.userName;
                        _authentication.useRefreshTokens = _useRefreshTokens;

                        deferred.resolve(response);

                    }).catch(function (err, status) {
                        _logOut();
                        deferred.reject(err.data);
                    });

                return deferred.promise;

            };

            var _logOut = function () {

                localStorageService.remove('authorizationData');

                _authentication.isAuthenticated = false;
                _authentication.userName = "";

            };

            var _fillAuthData = function () {

                var authData = localStorageService.get('authorizationData');
                if (authData) {
                    _authentication.isAuthenticated = true;
                    _authentication.userName = authData.userName;
                    _authentication.useRefreshTokens = authData.useRefreshTokens;
                }

            };

            var _refreshToken = function () {
                var deferred = $q.defer();

                var authData = localStorageService.get('authorizationData');

                if (authData) {

                    if (authData.useRefreshTokens) {

                        var data = 'grant_type=refresh_token&refresh_token=' + authData.refreshToken + '&client_id=' + _clientId;

                        localStorageService.remove('authorizationData');

                        $http.post(serviceBase + 'token', data, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
                            .then(function (response) {
                                localStorageService.set('authorizationData', {
                                    token: response.data.access_token, userName: response.data.userName,
                                    refreshToken: response.data.refresh_token, useRefreshTokens: _useRefreshTokens
                                });
                                deferred.resolve(response);
                            }).catch(function (err, status) {
                                _logOut();
                                deferred.reject(err);
                            });
                    }
                }

                return deferred.promise;
            };

            authServiceFactory.signUp = signUp;
            authServiceFactory.login = _login;
            authServiceFactory.logOut = _logOut;
            authServiceFactory.fillAuthData = _fillAuthData;
            authServiceFactory.authentication = _authentication;
            authServiceFactory.refreshToken = _refreshToken;

            return authServiceFactory;
        }]);
})();
