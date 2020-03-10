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

    controllerFn.$inject = ['$scope', '$state'];
    function controllerFn($scope, $state) {
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

        cpm.viewCourtDetails = function (event, court) {
            event.preventDefault();
            $state.go('main.court.details',
                { id: court.id },
                { custom: { force: true } }
            );
        };

        $scope.$on('modal.closing', function (event, reason, result) {
            if (!cpm.context.okToClose) {
                event.preventDefault();
                cpm.onInterrupt();
            }
        });

    }
})();
