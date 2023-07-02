(function () {
    'use strict';

    angular.module('siteModule')
        .component('drbblyInputmodal', {
            bindings: {
                model: '<',
                context: '<'
            },
            controllerAs: 'inp',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['$scope', 'drbblyEventsService', 'modalService'];
    function controllerFn($scope, drbblyEventsService, modalService) {
        var inp = this;

        inp.$onInit = function () {          
            inp.context.setOnInterrupt(inp.onInterrupt);
            drbblyEventsService.on('modal.closing', function (event, reason, result) {
                if (!inp.context.okToClose) {
                    event.preventDefault();
                    inp.context.okToClose = true;
                    inp.context.dismiss(reason);
                }
            }, $scope);
        };

        inp.onInterrupt = function (reason) {
            if (inp.frmInput.$dirty) {
                modalService.showUnsavedChangesWarning()
                    .then(function (response) {
                        if (response) {
                            inp.context.okToClose = true;
                            inp.context.dismiss(reason);
                        }
                    })
                    .catch(function (response) {
                        console.log(response);
                    });
            }
            else {
                inp.context.okToClose = true;
                inp.context.dismiss(reason);
            }
        };

        inp.submit = function () {
            inp.context.okToClose = true;
            inp.context.submit(inp.model.value);
        };

        inp.cancel = function () {
            inp.onInterrupt('cancelled');
        };
    }
})();
