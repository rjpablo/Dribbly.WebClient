(function () {
    'use strict';

    angular.module('siteModule')
        .service('settingsService', ['$location', '$q', '$http', function ($location, $q, $http) {
            var _service = this;
            var _siteRoot = 'http://localhost:30585/';
            var _hostName = $location.host();
            var _serviceBase = 'https://localhost:44394/'; //use this when auth API is running in Visual Studio
            //var _serviceBase = 'http://' + _hostName + ':1080/'; //use this to auth API in local IIS server
            //var _serviceBase = 'http://localhost:1080/'; //use this to auth API in local IIS server
            //var _serviceBase = 'http://www.dribbly001.somee.com/'; //use somee test server
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
                        console.log(error);
                        deferred.reject();
                    });

                return deferred.promise;
            };

            function buildSettings(data) {
                data.forEach(function (setting) {
                    _service[setting.key] = setting.value !== '' ? setting.value : setting.defaultValue;
                });

                _service.defaultDateFormat = 'short';
            }

            _service.getInitialSettings = _getInitialSettings;
            _service.siteRoot = _siteRoot;
            _service.serviceBase = _serviceBase;
            _service.clientId = _clientId;
            _service.clientSecret = _clientSecret;
            _service.useSideNavigator = false;

            return _service;
        }]);
})();