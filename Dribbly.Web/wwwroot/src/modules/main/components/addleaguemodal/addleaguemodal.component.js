(function () {
    'use strict';

    angular.module('mainModule')
        .component('drbblyAddleaguemodal', {
            bindings: {
                model: '<',
                context: '<',
                options: '<'
            },
            controllerAs: 'alm',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['$scope', 'modalService', 'drbblyEventsService', 'drbblyLeaguesService', 'drbblyCommonService',
        'drbblyDatetimeService', 'constants', 'drbblyOverlayService'];
    function controllerFn($scope, modalService, drbblyEventsService, drbblyLeaguesService, drbblyCommonService,
        drbblyDatetimeService, constants, drbblyOverlayService) {
        var alm = this;

        alm.$onInit = function () {
            alm.overlay = drbblyOverlayService.buildOverlay();
            alm.saveModel = {};

            alm.context.setOnInterrupt(alm.onInterrupt);
            drbblyEventsService.on('modal.closing', function (event, reason, result) {
                if (!alm.context.okToClose) {
                    event.preventDefault();
                    alm.onInterrupt();
                }
            }, $scope);
        };

        alm.onInterrupt = function (reason) {
            if (alm.frmLeagueDetails.$dirty) {
                modalService.showUnsavedChangesWarning()
                    .then(function (response) {
                        if (response) {
                            alm.context.okToClose = true;
                            alm.context.dismiss(reason);
                        }
                    })
                    .catch(function (response) {
                        console.log(response);
                    });
            }
            else {
                alm.context.okToClose = true;
                alm.context.dismiss(reason);
            }
        };

        alm.submit = function () {
            if (alm.frmLeagueDetails.$valid) {
                var saveModel = angular.copy(alm.saveModel);
                alm.isBusy = true;
                drbblyLeaguesService.addLeague(saveModel)
                    .then(function (result) {
                        alm.isBusy = false;
                        close(result);
                    }, function (error) {
                        alm.isBusy = false;
                        drbblyCommonService.handleError(error);
                    });
            }
        };

        function close(result) {
            alm.context.okToClose = true;
            alm.context.submit(result);
        }

        alm.cancel = function () {
            alm.onInterrupt('cancelled');
        };
    }
})();
