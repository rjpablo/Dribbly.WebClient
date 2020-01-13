(function () {
    'use strict';

    angular.module('siteModule')
        .service('drbblyhttpService', ['$http', 'settingsService', '$q',
            function ($http, settingsService, $q) {
                var _service = this;

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

                _service.get = _get;

                return _service;
            }]);
})();