(function () {
    'use strict';

    angular.module('appModule')
        .service('drbblyFileService', serviceFunc);
    serviceFunc.$inject = ['Upload', 'settingsService', '$rootScope', '$compile', '$interpolate', '$q'];
    function serviceFunc(Upload, settingsService, $rootScope, $compile, $interpolate, $q) {
        var _browseButton;

        async function upload(files, apiMethod, otherInfo) {
            var data;
            var compressedFiles;
            compressedFiles = await compressImages(files);

            if (compressedFiles.length) {
                data = { files: compressedFiles };
            }
            else {
                data = { file: compressedFiles };
            }

            data.otherInfo = JSON.stringify(otherInfo);

            return Upload.upload({
                url: settingsService.serviceBase + apiMethod,
                data: data
            });
        }

        /* File Compression methods - START */

        async function compressImages(files) {
            var compressionTasks = [];
            var result = [];
            for (var file of files) {
                var filename;
                var type;
                if (!['png', 'gif', 'jpg'].includes(getExtension(file.name))) {
                    filename = file.name.substr(0, file.name.lastIndexOf(".")) + ".jpg";
                    type = 'image/jpg';
                }
                else {
                    filename = file.name;
                    type = file.type;
                }
                // We don't have to compress files that aren't images
                if (!file.type.startsWith('image')) {
                    result.push(file);
                    continue;
                }

                // We compress the file by 50%
                compressionTasks.push(
                    compressImage(file, {
                        quality: 0.5,
                        type: type
                    }).then(blob => {
                        result.push(new File([blob], filename, {
                            type: type,
                        }));
                    })
                );
            }

            return $q.all(compressionTasks)
                .then(function () {
                    return result;
                })
        }

        function getExtension(path) {
            let baseName = path.split(/[\\/]/).pop(), // extracts file name from full path
                // (supports separators `\\` and `/`)
                pos = baseName.lastIndexOf("."); // gets the last position of `.`
            if (baseName === "" || pos < 1) // if the file name is empty or ...
                return ""; // the dot not found (-1) or comes first (0)
            return baseName.slice(pos + 1); // extracts extension ignoring "."
        }

        const compressImage = async (file, options) => {
            // Get as image data
            const imageBitmap = await createImageBitmap(file);

            // Draw to canvas
            const canvas = document.createElement('canvas');
            canvas.width = imageBitmap.width;
            canvas.height = imageBitmap.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(imageBitmap, 0, 0);

            // Turn into Blob
            return new Promise((resolve) =>
                canvas.toBlob(resolve, options.type, options.quality)
            );
        };

        /* File Compression methods - END */

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