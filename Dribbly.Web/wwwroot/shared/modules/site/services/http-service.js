(function () {
    'use strict';

    angular.module('siteModule')
        .service('drbblyhttpService', ['$http', 'settingsService', '$q',
            function ($http, settingsService, $q) {

                function _get(url, config) {
                    var deferred = $q.defer();
                    $http.get(settingsService.serviceBase + url, config)
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
                    post: _post
                };

                return service;
            }]);
})();