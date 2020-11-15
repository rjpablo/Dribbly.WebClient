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
