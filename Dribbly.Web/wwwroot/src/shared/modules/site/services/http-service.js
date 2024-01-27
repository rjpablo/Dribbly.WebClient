(function () {
    'use strict';

    angular.module('siteModule')
        .service('drbblyhttpService', ['$http', 'settingsService', '$q',
            function ($http, settingsService, $q) {

                function _get(url, config) {
                    return _getRaw(settingsService.serviceBase + url, config);
                }

                function _getRaw(url, config) {
                    var deferred = $q.defer();
                    $http.get(url, config)
                        .then(function (response) {
                            deferred.resolve(response.data);
                        })
                        .catch(function (response) {
                            deferred.reject(response.data);
                        });

                    return deferred.promise;
                }

                function _post(url, data) {
                    var deferred = $q.defer();
                    $http.post(settingsService.serviceBase + url, data)
                        .then(function (response) {
                            deferred.resolve(response.data);
                        })
                        .catch(function (response) {
                            deferred.reject(response.data);
                        });

                    return deferred.promise;
                }

                var service = {
                    get: _get,
                    getRaw: _getRaw,
                    post: _post
                };

                return service;
            }]);
})();