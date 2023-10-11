(function () {
    'use strict';

    angular.module('authModule')
        .component('drbblyChangepasswordmodal', {
            bindings: {
                model: '<',
                context: '<',
                options: '<'
            },
            controllerAs: 'cpm',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['$scope', 'modalService', 'drbblyEventsService', 'authService', 'drbblyCommonService'];
    function controllerFn($scope, modalService, drbblyEventsService, authService, drbblyCommonService) {
        var cpm = this;
        var _okToClose;

        cpm.$onInit = function () {
            cpm.saveModel = angular.copy((cpm.model || {}));

            cpm.context.setOnInterrupt(cpm.onInterrupt);
            drbblyEventsService.on('modal.closing', function (event, reason, result) {
                if (!_okToClose) {
                    event.preventDefault();
                    cpm.onInterrupt();
                }
            }, $scope);
        };

        cpm.onInterrupt = function (reason) {
            if (cpm.formChangePassword.$dirty) {
                modalService.showUnsavedChangesWarning()
                    .then(function (response) {
                        if (response) {
                            _okToClose = true;
                            cpm.context.dismiss(reason);
                        }
                    })
                    .catch(function (response) {
                        console.log(response);
                    });
            }
            else {
                _okToClose = true;
                cpm.context.dismiss(reason);
            }
        };

        cpm.submit = function () {
            cpm.saveModel.userId = authService.authentication.userId;
            authService.changePassword(cpm.saveModel)
                .then(function (result) {
                    if (result) {
                        close(true);
                    }
                })
                .catch(function (error) {
                    drbblyCommonService.handleError(error);
                });
        };

        function close(result) {
            _okToClose = true;
            cpm.context.submit(result);
        }

        cpm.cancel = function () {
            cpm.onInterrupt('cancelled');
        };
    }
})();
