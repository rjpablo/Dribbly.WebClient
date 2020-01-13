(function () {
    'use strict';
    angular.module('siteModule')
        .factory('authInterceptorService', ['$q', '$injector', '$location', 'localStorageService',
            function ($q, $injector, $location, localStorageService) {

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
                        var authService = $injector.get('authService');
                        var authData = localStorageService.get('authorizationData');

                        if (authData) {
                            if (authData.useRefreshTokens) {
                                authService.refreshToken()
                                    .then(function () {
                                        _retryHttpRequest(rejection.config, deferred);
                                    })
                                    .catch(function () {
                                        deferred.reject(rejection);
                                        authService.logOut();
                                        var $state = $injector.get('$state');
                                        $state.go('main.home', { reload: true })
                                            .finally(function () {
                                                $window.location.reload();
                                            });
                                    });
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
                    $http(config)
                        .then(function (response) {
                            deferred.resolve(response);
                        })
                        .catch(function (response) {
                            deferred.reject(response);
                        });
                };

                authInterceptorServiceFactory.request = _request;
                authInterceptorServiceFactory.responseError = _responseError;

                return authInterceptorServiceFactory;
            }]);
})();
