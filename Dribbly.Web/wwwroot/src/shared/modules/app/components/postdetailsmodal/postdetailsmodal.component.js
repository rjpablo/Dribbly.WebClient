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

    controllerFn.$inject = ['drbblyPostsService', '$scope', 'modalService', 'drbblyEventsService'];
    function controllerFn(drbblyPostsService, $scope, modalService, drbblyEventsService) {
        var pdm = this;

        pdm.$onInit = function () {

            if (pdm.options.isEdit) {
                //TODO Retrieve post details
            }
            else {
                pdm.post = angular.copy(pdm.model.post);
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

        pdm.submit = function () {
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
