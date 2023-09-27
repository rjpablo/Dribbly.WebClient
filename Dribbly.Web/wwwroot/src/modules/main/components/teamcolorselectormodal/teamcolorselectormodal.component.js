(function () {
    'use strict';

    angular.module('mainModule')
        .component('drbblyTeamcolorselectormodal', {
            bindings: {
                /*
                 * { title: string }
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
            psm.colors = [
                '#a90329',
                '#ff0100',
                '#ff4001',
                '#ff9601',
                '#ffbb01',
                '#47b601',
                '#196728',
                '#0093d3',
                '#033cff',
                '#1a44d3',
                '#4801ab',
                '#9400b6',
                '#b7004b',
                '#d32bb1',
                '#717171',
                '#373737',
                '#000000'
            ];

            psm.context.setOnInterrupt(psm.onInterrupt);
            drbblyEventsService.on('modal.closing', function (event, reason, result) {
                if (!psm.context.okToClose) {
                    event.preventDefault();
                    psm.onInterrupt();
                }
            }, $scope);
        };

        psm.select = function (color) {
            close(color);
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
