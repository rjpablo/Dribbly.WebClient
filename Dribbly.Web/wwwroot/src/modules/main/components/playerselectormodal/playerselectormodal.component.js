(function () {
    'use strict';

    angular.module('mainModule')
        .component('drbblyPlayerselectormodal', {
            bindings: {
                /*
                 * {
                 *  players: GamePlayer[]
                 * } 
                 * */
                model: '<',
                context: '<',
                options: '<'
            },
            controllerAs: 'psm',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['$scope', 'drbblyEventsService', 'constants', 'drbblyOverlayService'];
    function controllerFn($scope, drbblyEventsService, constants, drbblyOverlayService) {
        var psm = this;

        psm.$onInit = function () {            

            psm.context.setOnInterrupt(psm.onInterrupt);
            drbblyEventsService.on('modal.closing', function (event, reason, result) {
                if (!psm.context.okToClose) {
                    event.preventDefault();
                    psm.onInterrupt();
                }
            }, $scope);
        };

        psm.select = function (player) {
            close(player);
        };

        psm.onInterrupt = function (reason) {
            psm.context.okToClose = true;
            psm.context.dismiss(reason);
        };

        function close(result) {
            psm.context.okToClose = true;
            psm.context.submit(result);
        }

        psm.cancel = function () {
            psm.onInterrupt('cancelled');
        };
    }
})();
