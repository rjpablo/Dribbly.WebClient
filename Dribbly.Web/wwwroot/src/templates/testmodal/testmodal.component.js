(function () {
    'use strict';

    angular.module('mainModule')
        .component('drbblyBookgamemodal', {
            bindings: {
                model: '<',
                context: '<',
                options: '<'
            },
            controllerAs: 'mod',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['$scope', 'modalService', 'drbblyEventsService'];
    function controllerFn($scope, modalService, drbblyEventsService) {
        var mod = this;
        var _okToClose;

        mod.$onInit = function () {
            mod.saveModel = angular.copy((mod.model || {}));

            mod.context.setOnInterrupt(mod.onInterrupt);
            drbblyEventsService.on('modal.closing', function (event, reason, result) {
                if (!_okToClose) {
                    event.preventDefault();
                    mod.onInterrupt();
                }
            }, $scope);
        };

        mod.onInterrupt = function (reason) {
            if (mod.frmCourtDetails.$dirty) {
                modalService.showUnsavedChangesWarning()
                    .then(function (response) {
                        if (response) {
                            _okToClose = true;
                            mod.context.dismiss(reason);
                        }
                    })
                    .catch(function (response) {
                        console.log(response);
                    });
            }
            else {
                _okToClose = true;
                mod.context.dismiss(reason);
            }
        };

        mod.submit = function () {
            // some logic
            close('some data that is returned as a result');
        };

        function close(result) {
            _okToClose = true;
            mod.context.submit(result);
        }

        mod.cancel = function () {
            mod.onInterrupt('cancelled');
        };
    }
})();
