(function () {
    'use strict';

    angular.module('appModule')
        .service('drbblyFileService', ['Upload', 'settingsService', function (Upload, settingsService) {

            function upload(files, apiMethod) {
                var data;
                if (files.length) {
                    data = { files: files };
                }
                else {
                    data = { file: files };
                }
                return Upload.upload({
                    url: settingsService.serviceBase + apiMethod,
                    data: data
                });
            }

            var _service = {
                upload: upload
            };

            return _service;
        }]);

})();