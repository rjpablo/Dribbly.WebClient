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

    controllerFn.$inject = ['$scope', 'modalService'];
    function controllerFn($scope, modalService) {
        var cpm = this;

        cpm.$onInit = function () {
            cpm.context.setOnInterrupt(cpm.onInterrupt);
        };

        cpm.onInterrupt = function (reason) {
            cpm.context.okToClose = true;
            cpm.context.dismiss(reason);
        };

        cpm.close = function () {
            cpm.onInterrupt();
        };

        $scope.$on('modal.closing', function (event, reason, result) {
            if (!cpm.context.okToClose) {
                event.preventDefault();
                cpm.onInterrupt();
            }
        });

    }
})();
