(function () {
    'use strict';

    angular.module('appModule')
        .component('drbblyGallerymodal', {
            bindings: {
                model: '<',
                context: '<',
                options: '<'
            },
            controllerAs: 'gmc',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['$scope', 'modalService', 'drbblyEventsService', 'constants', 'drbblyOverlayService'];
    function controllerFn($scope, modalService, drbblyEventsService, constants, drbblyOverlayService) {
        var gmc = this;

        gmc.$onInit = function () {
            gmc.context.setOnInterrupt(gmc.onInterrupt);
            drbblyEventsService.on('modal.closing', function (event, reason, result) {
                if (!gmc.context.okToClose) {
                    event.preventDefault();
                    gmc.onInterrupt();
                }
            }, $scope);
        };

        gmc.onInterrupt = function (reason) {
            gmc.context.okToClose = true;
            gmc.context.dismiss(reason);
        };

        function close(result) {
            gmc.context.okToClose = true;
            gmc.context.submit(result);
        }

        gmc.cancel = function () {
            gmc.onInterrupt('cancelled');
        };
    }
})();
