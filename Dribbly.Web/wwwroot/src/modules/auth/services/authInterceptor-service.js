(function () {
    'use strict';
    angular.module('authModule')
        .factory('authInterceptorService', ['$q', '$injector', 'drbblyCommonService', 'localStorageService',
            '$location', '$state',
            function ($q, $injector, drbblyCommonService, localStorageService, $location, $state) {

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
                    if (rejection.status === 401) {
                        var authData = localStorageService.get('authorizationData');
                        var authService = $injector.get('authService');

                        if (authData && authData.useRefreshTokens) {
                            authService.refreshToken()
                                .then(function () {
                                    _retryHttpRequest(rejection.config, deferred);
                                })
                                .catch(function (error) {
                                    drbblyCommonService.handleError(error, 'site.Error_Auth_SessionExpired');
                                    deferred.reject(rejection);
                                    redirectoToLogin();
                                });
                        }
                        else {
                            redirectoToLogin();
                        }
                    }
                    else {
                        deferred.reject(rejection);
                    }
                    return deferred.promise;
                };

                var _retryHttpRequest = function (config, deferred) {
                    var $http = $injector.get('$http');
                    $http(config)
                        .then(function (response) {
                            deferred.resolve(response);
                        })
                        .catch(function (error) {
                            deferred.reject(error);
                            redirectoToLogin();
                        });
                };

                function redirectoToLogin() {
                    var resumeUrl = $location.url();
                    $state.go('auth.login',
                        {
                            resumeUrl: resumeUrl
                        },
                        {
                            custom: {
                                force: true // Prevents currently open modals from stopping the transition}
                            }
                        });
                }

                authInterceptorServiceFactory.request = _request;
                authInterceptorServiceFactory.responseError = _responseError;

                return authInterceptorServiceFactory;
            }]);
})();
