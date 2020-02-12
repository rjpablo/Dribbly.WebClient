(function () {
    'use strict';

    angular.module('appModule')
        .service('drbblyFileService', ['Upload', 'settingsService', function (Upload, settingsService) {

            function upload(file, apiMethod) {
                return Upload.upload({
                    url: settingsService.serviceBase + apiMethod,
                    data: { file: file }
                });
            }

            var _service = {
                upload: upload
            };

            return _service;
        }]);

})();