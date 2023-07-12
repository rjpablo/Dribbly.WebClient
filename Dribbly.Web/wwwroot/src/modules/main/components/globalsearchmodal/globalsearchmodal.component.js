(function () {
    'use strict';

    angular.module('mainModule')
        .component('drbblyGlobalsearchmodal', {
            bindings: {
                model: '<',
                context: '<',
                options: '<'
            },
            controllerAs: 'gsm',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['$scope', 'drbblyEventsService', 'constants'];
    function controllerFn($scope, drbblyEventsService, constants) {
        var gsm = this;

        gsm.$onInit = function () {

            gsm.context.setOnInterrupt(gsm.onInterrupt);
            drbblyEventsService.on('modal.closing', function (event, reason, result) {
                if (!gsm.context.okToClose) {
                    event.preventDefault();
                    gsm.onInterrupt();
                }
            }, $scope);
        };

        gsm.onInterrupt = function (reason) {
            gsm.context.okToClose = true;
            gsm.context.dismiss(reason);
        };

        function close(result) {
            gsm.context.okToClose = true;
            gsm.context.submit(result);
        }

        gsm.cancel = function () {
            gsm.onInterrupt('cancelled');
        };
    }
})();
