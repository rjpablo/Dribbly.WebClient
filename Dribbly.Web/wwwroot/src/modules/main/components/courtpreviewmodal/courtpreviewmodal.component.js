(function () {
    'use strict';

    angular.module('mainModule')
        .component('drbblyCourtpreviewmodal', {
            bindings: {
                model: '<',
                context: '=',
                options: '<'
            },
            controllerAs: 'cpm',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['$scope', '$state', 'drbblyCourtsService', 'drbblyOverlayService'];
    function controllerFn($scope, $state, drbblyCourtsService, drbblyOverlayService) {
        var cpm = this;

        cpm.$onInit = function () {
            cpm.overlay = drbblyOverlayService.buildOverlay();
            cpm.overlay.setToBusy();
            drbblyCourtsService.getCourt(cpm.model.court.id)
                .then(function (court) {
                    cpm.court = court;
                    cpm.overlay.setToReady();
                })
                .catch(cpm.overlay.setToError);
        };

        cpm.close = function () {
            cpm.context.okToClose = true;
            cpm.context.dismiss('canceled');
        };

        cpm.viewCourtDetails = function (event, court) {
            event.preventDefault();
            $state.go('main.court.home',
                { id: court.id },
                { custom: { force: true } }
            );
        };

        $scope.$on('modal.closing', function (event, reason, result) {
            if (!cpm.context.okToClose) {
                // prevent closing of  modal and use the context.dismiss function
                // to do clean(e.g.unsubcribe from events) before closing the modal
                event.preventDefault();
                cpm.close();
            }
        });

    }
})();
