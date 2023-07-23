(function () {
    'use strict';

    angular.module('siteModule')
        .service('settingsService', serviceFn);
    serviceFn.$inject = ['$location', '$q', '$http', 'constants', 'drbblyCommonService'];
    function serviceFn($location, $q, $http, constants, drbblyCommonService) {
        var _service = this;
        var _siteRoot = 'https://localhost:44395/';
        var _hostName = $location.host();
        var _servicePreset = 1; // 1 => VS, 2 => online dev server, 2 => online test server, 3 => local IIS
        var _serviceBase = _servicePreset === 1 ? 'https://localhost:44394/' : // Local DEV
            _servicePreset === 2 ? 'http://ttwdev1-001-site2.ctempurl.com/' : // Online DEV
                _servicePreset === 3 ? 'http://ttwdev1-001-site5.ctempurl.com/' : // Online TEST
                    'http://' + _hostName + ':1080/'; // Local IIS
        var _clientId = 'dribbly-web';
        var _clientSecret = '5YV7M1r981yoGhELyB84aC+KiYksxZf1OY3++C1CtRM=';
        var _settingsApiBaseUrl = 'api/settings/';

        var _getInitialSettings = function () {
            var deferred = $q.defer();
            $http.get(_serviceBase + _settingsApiBaseUrl + 'getInitialSettings')
                .then(function (result) {
                    constants['Fouls'] = JSON.parse(result.data.drbblySingleOrDefault(s => s.key === 'Fouls').value);
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
            _service.defaultTimeFormat = 'h:mm a';
            _service.suppressNotifications = true;
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