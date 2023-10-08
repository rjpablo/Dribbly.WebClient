(function () {
    'use strict';

    angular.module('appModule')
        .component('drbblyPostdetailsmodal', {
            bindings: {
                model: '<',
                context: '<',
                options: '<'
            },
            controllerAs: 'pdm',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['drbblyPostsService', '$scope', 'modalService', 'drbblyEventsService', 'drbblyFileService'];
    function controllerFn(drbblyPostsService, $scope, modalService, drbblyEventsService, drbblyFileService) {
        var pdm = this;
        var _tempId = 0;

        pdm.$onInit = function () {
            pdm.attachments = [];
            pdm.methods = {};
            if (pdm.options.isEdit) {
                //TODO Retrieve post details
            }
            else {
                pdm.post = angular.copy(pdm.model.post);
            }

            pdm.gridOptions = {
                urlKey: 'url',
                isResponsive: false,
                onClicked: function (image) {
                    alert(JSON.stringify(image))
                },
                onBuilded: function () {
                    console.log("built completed!")
                    $scope.isBuildingGrid = false;
                },
                sortByKey: 'nth',
                margin: 2,
                maxLength: 4
            }

            pdm.context.setOnInterrupt(pdm.onInterrupt);
            drbblyEventsService.on('modal.closing', function (event, reason, result) {
                if (!pdm.context.okToClose) {
                    event.preventDefault();
                    pdm.onInterrupt();
                }
            }, $scope);
        };

        pdm.onInterrupt = function (reason) {
            if (pdm.frmPostDetails.$dirty) {
                modalService.showUnsavedChangesWarning()
                    .then(function (response) {
                        if (response) {
                            pdm.context.okToClose = true;
                            pdm.context.dismiss(reason);
                        }
                    })
                    .catch(function (response) {
                        console.log(response);
                    });
            }
            else {
                pdm.context.okToClose = true;
                pdm.context.dismiss(reason);
            }
        };

        pdm.submit = async function () {
            var newAttachments = pdm.attachments.drbblyWhere(f => f.isNew);
            var proceed = true;
            if (newAttachments.length > 0) {
                await drbblyFileService.upload(newAttachments.map(f => f.file), 'api/Multimedia/Upload')
                    .then(result => {
                        var uploadedFiles = result.data;
                        for (var x = 0; x < uploadedFiles.length; x++) {
                            Object.assign(newAttachments[x], uploadedFiles[x]);
                        }
                    })
                    .catch(error => {
                        proceed = false;
                    });
            }
            if (proceed) {
                pdm.post.fileIds = pdm.attachments.map(a => a.id);
                pdm.frmPostDetails.$setSubmitted();
                if (pdm.frmPostDetails.$valid) {
                    pdm.isBusy = true;
                    if (pdm.model.isEdit) {
                        editPost(pdm.post);
                    }
                    else {
                        addPost(pdm.post);
                    }
                }
            }
        };

        pdm.onMediaSelect = function (files) {
            var newMedia = files.map(file => {
                return {
                    id: --_tempId,
                    url: URL.createObjectURL(file),
                    deletable: true,
                    isNew: true,
                    file: file
                };
            })
            pdm.attachments = pdm.attachments.concat(newMedia);
            pdm.frmPostDetails.$setDirty();
        }


        pdm.deletePhoto = function (img, cb) {
            pdm.attachments.drbblyRemove(a => a.id == img.id);
        };

        function editPost(post) {
            drbblyPostsService.updatePost(post)
                .then(function () {
                    close(post);
                })
                .catch(function () {
                    //TODO: handle error
                })
                .finally(function () {
                    pdm.isBusy = false;
                });
        }

        function addPost(post) {
            drbblyPostsService.addPost(post)
                .then(function (result) {
                    close(result);
                })
                .catch(function () {
                    //TODO: handle error
                })
                .finally(function () {
                    pdm.isBusy = false;
                });
        }

        function close(post) {
            pdm.context.okToClose = true;
            pdm.context.submit(post);
        }

        pdm.cancel = function () {
            pdm.onInterrupt('cancelled');
        };
    }
})();
