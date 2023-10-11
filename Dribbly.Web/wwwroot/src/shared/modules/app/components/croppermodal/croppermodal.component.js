(function () {
    'use strict';

    angular.module('appModule')
        .component('drbblyCroppermodal', {
            bindings: {
                model: '<',
                context: '<',
                options: '<'
            },
            controllerAs: 'bgm',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['$scope', 'modalService', 'drbblyEventsService', 'drbblyGamesService', 'drbblyCommonService',
        'drbblyDatetimeService', 'constants', 'drbblyOverlayService'];
    function controllerFn($scope, modalService, drbblyEventsService, drbblyGamesService, drbblyCommonService,
        drbblyDatetimeService, constants, drbblyOverlayService) {
        var bgm = this;

        bgm.$onInit = function () {
            bgm.overlay = drbblyOverlayService.buildOverlay();
            bgm.cropperMethods = {};

            bgm.context.setOnInterrupt(bgm.onInterrupt);
            drbblyEventsService.on('modal.closing', function (event, reason, result) {
                if (!bgm.context.okToClose) {
                    event.preventDefault();
                    bgm.onInterrupt();
                }
            }, $scope);
        };

        bgm.onInterrupt = function (reason) {
            modalService.showUnsavedChangesWarning()
                .then(function (response) {
                    if (response) {
                        bgm.context.okToClose = true;
                        bgm.context.dismiss(reason);
                    }
                })
                .catch(function (response) {
                    console.log(response);
                });
        };

        bgm.submit = function () {
            bgm.cropperMethods.getCroppedImageData(function (blob) {
                close(blob);
            });
        };

        function close(result) {
            bgm.context.okToClose = true;
            bgm.context.submit(result);
        }

        bgm.cancel = function () {
            bgm.onInterrupt('cancelled');
        };
    }
})();
