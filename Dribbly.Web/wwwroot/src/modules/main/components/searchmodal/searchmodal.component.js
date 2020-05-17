(function () {
    'use strict';

    angular.module('mainModule')
        .component('drbblySearchmodal', {
            bindings: {
                model: '<',
                context: '<',
                options: '<'
            },
            controllerAs: 'src',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['$scope', '$timeout', 'drbblyEventsService', 'drbblyCourtsService'];
    function controllerFn($scope, $timeout, drbblyEventsService, drbblyCourtsService) {
        var src = this;
        var _okToClose;

        src.$onInit = function () {
            src.saveModel = angular.copy(src.model || {});
            src.courtsFound = [];

            src.context.setOnInterrupt(src.onInterrupt);
            drbblyEventsService.on('modal.closing', function (event) {
                if (!_okToClose) {
                    event.preventDefault();
                    src.onInterrupt();
                }
            }, $scope);

            $timeout(function () {
                src.frmCourtDetails.txtName.$$element.focus();
            });
        };

        src.onInterrupt = function (reason) {
            _okToClose = true;
            src.context.dismiss(reason);
        };

        src.go = function () {
            src.isBusy = true;
            src.courtsFound.length = 0;
            drbblyCourtsService.FindCourts(src.searchInput)
                .then(function (result) {
                    src.hasPerformedSearch = true;
                    src.courtsFound = result;
                    src.isBusy = false;
                })
                .catch(function () {
                    src.isBusy = false;
                });
        };

        src.cancel = function () {
            src.onInterrupt('cancelled');
        };

        src.isValidSearchCriteria = function () {
            return src.searchInput && src.searchInput.name;
        };
    }
})();
