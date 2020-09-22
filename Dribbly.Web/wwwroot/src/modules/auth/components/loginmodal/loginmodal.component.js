(function () {
    'use strict';

    angular.module('authModule')
        .component('drbblyLoginmodal', {
            bindings: {
                model: '<',
                context: '<',
                options: '<'
            },
            controllerAs: 'mod',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['$scope', 'drbblyEventsService'];
    function controllerFn($scope, drbblyEventsService) {
        var mod = this;

        mod.$onInit = function () {
            mod.saveModel = angular.copy((mod.model || {}));

            drbblyEventsService.on('modal.closing', function (event, reason, result) {
                if (!mod.context.okToClose) {
                    event.preventDefault();
                    mod.cancel();
                }
            }, $scope);
        };

        mod.submit = function () {
            // some logic
            close('some data that is returned as a result');
        };

        mod.onLoginSuccess = function () {
            mod.context.okToClose = true;
            mod.context.submit({ isLoginSuccessful: true });
        };

        function close(result) {
            mod.context.okToClose = true;
            mod.context.submit(result);
        }

        mod.cancel = function () {
            mod.context.okToClose = true;
            mod.context.dismiss();
        };
    }
})();
