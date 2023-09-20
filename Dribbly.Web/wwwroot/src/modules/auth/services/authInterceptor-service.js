(function () {
    'use strict';
    angular.module('authModule')
        .factory('authInterceptorService', ['$q', '$injector', 'localStorageService',
            function ($q, $injector, localStorageService) {

                var authInterceptorServiceFactory = {};

                var _request = function (config) {

                    config.headers = config.headers || {};

                    var authData = localStorageService.get('authorizationData');
                    if (authData) {
                        config.headers.Authorization = 'Bearer ' + authData.token;
                    }

                    return config;
                };

                var _responseError = function (rejection) {
                    var deferred = $q.defer();
                    if (rejection.status === 401) { //Access denied
                        var authData = localStorageService.get('authorizationData');
                        var authService = $injector.get('authService');

                        if (authData && authData.useRefreshTokens && !rejection.config.isRetried) {
                            authService.refreshToken()
                                .then(function () {
                                    _retryHttpRequest(rejection.config, deferred);
                                }, function (error) {
                                    if (rejection.config.triggersLogin === false) {
                                        deferred.reject(rejection);
                                    }
                                    else {
                                        authService.showLoginModal()
                                            .then(function (result) {
                                                if (result.isLoginSuccessful) {
                                                    _retryHttpRequest(rejection.config, deferred);
                                                }
                                            }, function () {
                                                deferred.reject(rejection);
                                            });
                                    }
                                });
                        }
                        else if (!rejection.config.isRetried && rejection.config.triggersLogin !== false) {
                            authService.showLoginModal()
                                .then(function (result) {
                                    if (result.isLoginSuccessful) {
                                        _retryHttpRequest(rejection.config, deferred);
                                    }
                                }, function () {
                                    deferred.reject(rejection);
                                });
                        }
                        else {
                            if (rejection.config.triggersLogin !== false) {
                                authService.showLoginModal();
                            }
                        }
                    }
                    else {
                        deferred.reject(rejection);
                    }
                    return deferred.promise;
                };

                var _retryHttpRequest = function (config, deferred) {
                    var $http = $injector.get('$http');
                    config.isRetried = true;
                    $http(config)
                        .then(function (response) {
                            deferred.resolve(response);
                        }, function (error) {
                            deferred.reject(error);
                        });
                };

                authInterceptorServiceFactory.request = _request;
                authInterceptorServiceFactory.responseError = _responseError;

                return authInterceptorServiceFactory;
            }]);
})();
