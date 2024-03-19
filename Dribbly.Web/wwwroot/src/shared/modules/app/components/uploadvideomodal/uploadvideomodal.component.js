(function () {
    'use strict';

    angular.module('appModule')
        .component('drbblyUploadvideomodal', {
            bindings: {
                // model properties:
                // onSubmit - must be a promise from the service call for uploading the file
                model: '<',
                context: '<',
                options: '<'
            },
            controllerAs: 'uvm',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['$scope', 'modalService', 'drbblyEventsService', '$timeout', 'drbblyCommonService',
        '$element', 'drbblyFileService'];
    function controllerFn($scope, modalService, drbblyEventsService, $timeout, drbblyCommonService,
        $element, drbblyFileService) {
        var uvm = this;
        var _videoElement;
        var _selectedFile;
        var _uploadInstance;
        var _thumbnailFile;

        uvm.$onInit = function () {
            uvm.saveModel = {};

            _videoElement = $element.find('video')[0];
            if (_videoElement) {
                _selectedFile = uvm.model.file;
                setVideoElement(_selectedFile);
                generateThumbnail();

                uvm.context.setOnInterrupt(uvm.onInterrupt);
                drbblyEventsService.on('modal.closing', function (event, reason, result) {
                    if (!uvm.context.okToClose) {
                        event.preventDefault();
                        uvm.onInterrupt();
                    }
                }, $scope);

                _videoElement.onseeked = () => {
                    generateThumbnail(_videoElement.currentTime);
                }
            }
            else {
                throw new Error("The video element could not be found");
            }
        };

        function setVideoElement(videoFile) {
            if (uvm.tempUrl) {
                URL.revokeObjectURL(uvm.tempUrl);
            }
            uvm.tempUrl = URL.createObjectURL(videoFile);
            uvm.fileName = videoFile.name;
            _videoElement.src = uvm.tempUrl + "#t=0.5";
        }

        uvm.onInterrupt = function (reason) {
            if (uvm.frmUploadVideo.$dirty) {
                modalService.showUnsavedChangesWarning()
                    .then(function (response) {
                        if (response) {
                            uvm.context.okToClose = true;
                            uvm.context.dismiss(reason);
                        }
                    })
                    .catch(function (response) {
                        console.log(response);
                    });
            }
            else {
                uvm.context.okToClose = true;
                uvm.context.dismiss(reason);
            }
        };

        uvm.replaceVideo = function (event) {
            drbblyFileService.browseVideo(function (files) {
                if (files && files.length) {
                    _selectedFile = files[0];
                    setVideoElement(_selectedFile);
                    generateThumbnail();
                }
            }, event);
        };

        function generateThumbnail(timePosition = 0.01) {
            return videoToImage(_selectedFile, { frameTimeInSeconds: timePosition, extension: 'png', filename: 'thumb' })
                .then(res => {
                    $timeout(() => {
                        _thumbnailFile = res;
                        uvm.thumbnailUrl = URL.createObjectURL(_thumbnailFile);
                    });
                });
        }

        uvm.submit = function () {
            if (uvm.frmUploadVideo.$valid) {
                if (uvm.model.onSubmit) {
                    uvm.isBusy = true;
                    uvm.isUploading = true;
                    uvm.uploadProgress = 0;
                    drbblyFileService.upload([_thumbnailFile], 'api/Multimedia/Upload')
                        .then(res => {
                            uvm.saveModel.thumbnailUrl = res.data[0].url;
                            _uploadInstance = uvm.model.onSubmit(_selectedFile, uvm.saveModel);
                            _uploadInstance.then(function (result) {
                                if (result.data) {
                                    close(result.data);
                                    uvm.isUploading = false;
                                }
                            }, function (e) {
                                uvm.isBusy = false;
                                uvm.isUploading = false;
                                if (e.xhrStatus !== 'abort') {
                                    modalService.showGenericErrorModal();
                                }
                            }, function (evt) {
                                uvm.uploadProgress = parseInt(100.0 * evt.loaded / evt.total);
                                uvm.uploadIsDone = uvm.uploadProgress === 100;
                                uvm.isUploading = !uvm.uploadIsDone;
                            });
                        })
                }
                else {
                    throw new Error("onSubmit function was not provided");
                }
            }
        };

        function videoToImage(videoFile, options) {
            return new Promise((resolve) => {
                const canvas = document.createElement('canvas')
                const video = document.createElement('video')
                const source = document.createElement('source')
                const context = canvas.getContext('2d')
                const urlRef = URL.createObjectURL(videoFile)

                video.style.display = 'none'
                canvas.style.display = 'none'

                source.setAttribute('src', urlRef)
                video.setAttribute('crossorigin', 'anonymous')
                video.setAttribute('preload', 'metadata')

                video.appendChild(source)
                document.body.appendChild(canvas)
                document.body.appendChild(video)

                if (!context) {
                    return
                }

                video.currentTime = options.frameTimeInSeconds
                video.load()

                video.addEventListener('loadedmetadata', function () {
                    canvas.width = video.videoWidth
                    canvas.height = video.videoHeight
                })

                video.addEventListener('loadeddata', function () {
                    setTimeout(() => {
                        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight)

                        canvas.toBlob((blob) => {
                            if (!blob) return
                            resolve(
                                new File([blob], (options.filename || videoFile.name) + "_preview." + options.extension, {
                                    type: 'image/' + options.extension
                                })
                            )
                            URL.revokeObjectURL(urlRef)

                            video.remove()
                            canvas.remove()
                        }, 'image/' + options.extension)
                    }, 2000)
                })
            })
        }

        function close(result) {
            uvm.context.okToClose = true;
            uvm.context.submit(result);
        }

        uvm.cancel = function () {
            if (uvm.isUploading && _uploadInstance) {
                _uploadInstance.abort();
                _uploadInstance = null;
                uvm.isUploading = false;
            }
            uvm.onInterrupt('cancelled');
        };
    }
})();
