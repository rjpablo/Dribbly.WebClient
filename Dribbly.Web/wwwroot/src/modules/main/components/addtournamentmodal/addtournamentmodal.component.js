(function () {
    'use strict';

    angular.module('mainModule')
        .component('drbblyAddtournamentmodal', {
            bindings: {
                model: '<',
                context: '<',
                options: '<'
            },
            controllerAs: 'atm',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['$scope', 'modalService', 'drbblyEventsService', 'drbblyTournamentsService', 'drbblyCommonService',
        'drbblyDatetimeService', 'constants', 'drbblyOverlayService'];
    function controllerFn($scope, modalService, drbblyEventsService, drbblyTournamentsService, drbblyCommonService,
        drbblyDatetimeService, constants, drbblyOverlayService) {
        var atm = this;

        atm.$onInit = function () {
            atm.overlay = drbblyOverlayService.buildOverlay();
            atm.saveModel = {};

            atm.context.setOnInterrupt(atm.onInterrupt);
            drbblyEventsService.on('modal.closing', function (event, reason, result) {
                if (!atm.context.okToClose) {
                    event.preventDefault();
                    atm.onInterrupt();
                }
            }, $scope);
        };

        atm.onInterrupt = function (reason) {
            if (atm.frmTournamentDetails.$dirty) {
                modalService.showUnsavedChangesWarning()
                    .then(function (response) {
                        if (response) {
                            atm.context.okToClose = true;
                            atm.context.dismiss(reason);
                        }
                    })
                    .catch(function (response) {
                        console.log(response);
                    });
            }
            else {
                atm.context.okToClose = true;
                atm.context.dismiss(reason);
            }
        };

        atm.submit = function () {
            if (atm.frmTournamentDetails.$valid) {
                var saveModel = angular.copy(atm.saveModel);
                atm.isBusy = true;
                drbblyTournamentsService.addTournament(saveModel)
                    .then(function (result) {
                        atm.isBusy = false;
                        close(result);
                    }, function (error) {
                        atm.isBusy = false;
                        drbblyCommonService.handleError(error);
                    });
            }
        };

        function close(result) {
            atm.context.okToClose = true;
            atm.context.submit(result);
        }

        atm.cancel = function () {
            atm.onInterrupt('cancelled');
        };
    }
})();
