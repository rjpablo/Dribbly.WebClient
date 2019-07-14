(function () {
    'use strict';

    angular.module('siteModule')
        .factory('authService', ['$http', '$q', 'localStorageService', function ($http, $q, localStorageService) {

            //var serviceBase = 'http://localhost:1842/'; //use this when auth API is running in Visual Studio
            var serviceBase = 'http://localhost:9020/'; //use this to auth API in local IIS server
            var authServiceFactory = {};

            var _authentication = {
                isAuth: false,
                userName: ""
            };

            var signUp = function (registration) {

                _logOut();

                return $http.post(serviceBase + 'api/account/register', registration);

            };

            var _login = function (loginData) {

                var data = "grant_type=password&username=" + loginData.userName + "&password=" + loginData.password;

                var deferred = $q.defer();

                $http.post(serviceBase + 'token', data, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
                    .then(function (response) {

                        localStorageService.set('authorizationData', { token: response.data.access_token, userName: loginData.userName });

                        _authentication.isAuth = true;
                        _authentication.userName = loginData.userName;

                        deferred.resolve(response);

                    }).catch(function (err, status) {
                        _logOut();
                        deferred.reject(err.data);
                    });

                return deferred.promise;

            };

            var _logOut = function () {

                localStorageService.remove('authorizationData');

                _authentication.isAuth = false;
                _authentication.userName = "";

            };

            var _fillAuthData = function () {

                var authData = localStorageService.get('authorizationData');
                if (authData) {
                    _authentication.isAuth = true;
                    _authentication.userName = authData.userName;
                }

            };

            authServiceFactory.signUp = signUp;
            authServiceFactory.login = _login;
            authServiceFactory.logOut = _logOut;
            authServiceFactory.fillAuthData = _fillAuthData;
            authServiceFactory.authentication = _authentication;

            return authServiceFactory;
        }]);
})();