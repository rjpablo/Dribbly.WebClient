(function () {
    'use strict';

    angular.module('siteModule')
        .service('settingsService', serviceFn);
    serviceFn.$inject = ['$location', '$q', '$http', '$rootScope', 'drbblyCommonService'];
    function serviceFn($location, $q, $http, $rootScope, drbblyCommonService) {
        var _service = this;
        var _siteRoot = 'http://localhost:30585/';
        var _hostName = $location.host();
        var _servicePreset = 2; // 1 => VS, 2 => online test server, 3 => local IIS
        var _serviceBase = _servicePreset === 1 ? 'https://localhost:44394/' :
            _servicePreset === 2 ? 'http://www.dribbly001.somee.com/' :
                'http://' + _hostName + ':1080/';
        var _clientId = 'dribbly-web';
        var _clientSecret = '5YV7M1r981yoGhELyB84aC+KiYksxZf1OY3++C1CtRM=';
        var _settingsApiBaseUrl = 'api/settings/';

        var _getInitialSettings = function () {
            var deferred = $q.defer();
            $http.get(_serviceBase + _settingsApiBaseUrl + 'getInitialSettings')
                .then(function (result) {
                    buildSettings(result.data);
                    deferred.resolve();
                })
                .catch(function (error) {
                    drbblyCommonService.handleError(error);
                    deferred.reject();
                });

            return deferred.promise;
        };

        function buildSettings(data) {
            data.forEach(function (setting) {
                _service[setting.key] = setting.value !== '' ? setting.value : setting.defaultValue;
            });

            _service.defaultDateFormat = 'MMM d, y h:mm a';
        }

        _service.getInitialSettings = _getInitialSettings;
        _service.siteRoot = _siteRoot;
        _service.serviceBase = _serviceBase;
        _service.clientId = _clientId;
        _service.clientSecret = _clientSecret;
        _service.useSideNavigator = false;

        return _service;
    }
})();