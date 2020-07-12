(function () {
    'use strict';

    angular.module('appModule')
        .service('drbblyFileService', serviceFunc);
    serviceFunc.$inject = ['Upload', 'settingsService', '$rootScope', '$compile', '$interpolate'];
    function serviceFunc(Upload, settingsService, $rootScope, $compile, $interpolate) {
        var _browseButton;

        function upload(files, apiMethod, otherInfo) {
            var data;
            if (files.length) {
                data = { files: files };
            }
            else {
                data = { file: files };
            }

            data.otherInfo = JSON.stringify(otherInfo);

            return Upload.upload({
                url: settingsService.serviceBase + apiMethod,
                data: data
            });
        }

        function browseVideo(callback, event) {
            var options = {
                pattern: '\'video/*\'',
                accept: '\'video/*\'',
                maxSize: settingsService.maxVideoUploadMb + 'MB',
                multiple: false,
                onSelect: function (files, e) {
                    callback(files);
                    // Dispose auto generated button and input element
                    // NOTE: The auto-generated elements are not disposed if the user cancels the file browser dialog
                    // TODO: Find a way to dispose the elements when the dialog is cancelled
                    if (e && e.currentTarget) {
                        e.currentTarget.remove();
                    }
                    _browseButton.remove();
                }
            };
            browseFile(options, event);
        }

        function browseFile(options, event) {
            _browseButton = buildInput(options, event);
            _browseButton.click();
        }

        function buildInput(options) {
            var scope = $rootScope.$new();
            scope = Object.assign(scope, options);
            var template = $interpolate(`<button ngf-select="onSelect($files, $event)"
                                    ngf-pattern="{{pattern}}"
                                    ngf-multiple="{{multiple}}"
                                    ngf-accept="{{accept}}"
                                    ngf-max-size="{{maxSize}}"
                                    ng-model="{{model}}"
                                    class="d-none"></button>`)(options);
            var elem = $compile(template)(scope);
            document.body.append(elem[0]);
            return elem;
        }

        var _service = {
            browseVideo: browseVideo,
            upload: upload
        };

        return _service;
    }

})();