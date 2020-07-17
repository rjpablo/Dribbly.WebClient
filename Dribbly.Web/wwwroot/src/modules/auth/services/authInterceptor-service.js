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
                    if (rejection.status === 401) { //Access denied
                        var authData = localStorageService.get('authorizationData');
                        var authService = $injector.get('authService');

                        if (authData && authData.useRefreshTokens && !rejection.config.isRetried) {
                            authService.refreshToken()
                                .then(function () {
                                    _retryHttpRequest(rejection.config, deferred);
                                }, function (error) {
                                    drbblyCommonService.handleHttpError(error);
                                    redirectoToLogin();
                                });
                        }
                        else {
                            drbblyCommonService.handleHttpError(rejection);
                            redirectoToLogin();
                        }
                    }
                    else {
                        drbblyCommonService.handleHttpError(rejection);
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

                function redirectoToLogin() {
                    var resumeUrl = $location.url();
                    // TODO: Display message on login page (e.g. You're session has expired. Please log in again to proceed)
                    $state.go('auth.login',
                        {
                            resumeUrl: resumeUrl,
                            messageKey: 'auth.PleaseLoginToProceed'
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
