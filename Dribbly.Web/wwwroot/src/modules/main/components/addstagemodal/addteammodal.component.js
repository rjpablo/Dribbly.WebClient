(function () {
    'use strict';

    angular.module('mainModule')
        .component('drbblyAddstagemodal', {
            bindings: {
                model: '<',
                context: '<',
                options: '<'
            },
            controllerAs: 'asm',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['$scope', 'modalService', 'drbblyEventsService', 'drbblyTournamentsService', 'drbblyCommonService',
        'drbblyDatetimeService', 'constants', 'drbblyOverlayService'];
    function controllerFn($scope, modalService, drbblyEventsService, drbblyTournamentsService, drbblyCommonService,
        drbblyDatetimeService, constants, drbblyOverlayService) {
        var asm = this;

        asm.$onInit = function () {
            asm.overlay = drbblyOverlayService.buildOverlay();
            asm.saveModel = {};

            asm.context.setOnInterrupt(asm.onInterrupt);
            drbblyEventsService.on('modal.closing', function (event, reason, result) {
                if (!asm.context.okToClose) {
                    event.preventDefault();
                    asm.onInterrupt();
                }
            }, $scope);
        };

        asm.submit = function () {
            if (asm.frmStageDetails.$valid) {
                var saveModel = angular.copy(asm.saveModel);
                saveModel.tournamentId = asm.model.tournament.id;
                asm.isBusy = true;
                drbblyTournamentsService.addTournamentStage(saveModel)
                    .then(function () {
                        asm.isBusy = false;
                        close();
                    }, function (error) {
                        asm.isBusy = false;
                        drbblyCommonService.handleError(error);
                    });
            }
        };

        asm.onInterrupt = function (reason) {
            if (asm.frmStageDetails.$dirty) {
                modalService.showUnsavedChangesWarning()
                    .then(function (response) {
                        if (response) {
                            asm.context.okToClose = true;
                            asm.context.dismiss(reason);
                        }
                    })
                    .catch(function (response) {
                        console.log(response);
                    });
            }
            else {
                asm.context.okToClose = true;
                asm.context.dismiss(reason);
            }
        };

        function close(result) {
            asm.context.okToClose = true;
            asm.context.submit(result);
        }

        asm.cancel = function () {
            asm.onInterrupt('cancelled');
        };
    }
})();
