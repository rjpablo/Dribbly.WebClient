(function () {
    'use strict';

    angular.module('mainModule')
        .component('drbblyPlayerselectionmodal', {
            bindings: {
                /**
                 * {
                 *  players: [GamePlayerModel],
                 *  title: [string], //the title of the modal
                 * }
                 * */
                model: '<',
                context: '<',
                options: '<'
            },
            controllerAs: 'mmc',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['$scope', 'modalService', 'drbblyEventsService', 'constants', 'drbblyOverlayService'];
    function controllerFn($scope, modalService, drbblyEventsService, constants, drbblyOverlayService) {
        var mmc = this;

        mmc.$onInit = function () {
            mmc.overlay = drbblyOverlayService.buildOverlay();
            mmc.foulPlayerOptions = [mmc.model.performedBy];
            mmc.foulTypeOptions = constants.Fouls;
            mmc.saveModel = angular.copy(mmc.model, {});
            mmc.context.setOnInterrupt(mmc.onInterrupt);
            drbblyEventsService.on('modal.closing', function (event, reason, result) {
                if (!mmc.context.okToClose) {
                    event.preventDefault();
                    mmc.onInterrupt();
                }
            }, $scope);
        };

        mmc.onItemClicked = function (player) {
            close(player);
        };

        mmc.onInterrupt = function (reason) {
            mmc.context.okToClose = true;
            mmc.context.dismiss(reason);
        };

        function close(result) {
            mmc.context.okToClose = true;
            mmc.context.submit(result);
        }

        mmc.cancel = function () {
            mmc.onInterrupt('cancelled');
        };
    }
})();
