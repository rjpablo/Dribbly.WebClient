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
        var _unregisterLoginSuccessful;

        mod.$onInit = function () {
            mod.saveModel = angular.copy((mod.model || {}));

            drbblyEventsService.on('modal.closing', function (event, reason, result) {
                if (!mod.context.okToClose) {
                    event.preventDefault();
                    mod.cancel();
                }
            }, $scope);

            _unregisterLoginSuccessful = drbblyEventsService.on('dribbly.login.successful', (event, data) => {
                close({ isLoginSuccessful: true });
            });
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

        mod.$onDestroy = function () {
            _unregisterLoginSuccessful();
        }
    }
})();
