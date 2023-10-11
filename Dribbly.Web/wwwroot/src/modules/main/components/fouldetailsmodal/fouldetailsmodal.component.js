(function () {
    'use strict';

    angular.module('mainModule')
        .component('drbblyFouldetailsmodal', {
            bindings: {
                /**
                 * {
                 *  performedBy: [GamePlayerModel],
                 *  game: [GameModel]
                 * }
                 * */
                model: '<',
                context: '<',
                options: '<'
            },
            controllerAs: 'rsm',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['$scope', 'modalService', 'drbblyEventsService', 'constants', 'drbblyOverlayService'];
    function controllerFn($scope, modalService, drbblyEventsService, constants, drbblyOverlayService) {
        var rsm = this;

        rsm.$onInit = function () {
            rsm.overlay = drbblyOverlayService.buildOverlay();
            rsm.foulPlayerOptions = [rsm.model.performedBy];
            rsm.foulTypeOptions = constants.Fouls;
            rsm.saveModel = angular.copy(rsm.model, {});
            rsm.context.setOnInterrupt(rsm.onInterrupt);
            drbblyEventsService.on('modal.closing', function (event, reason, result) {
                if (!rsm.context.okToClose) {
                    event.preventDefault();
                    rsm.onInterrupt();
                }
            }, $scope);
        };

        rsm.onInterrupt = function (reason) {
            if (rsm.frmFoul.$dirty) {
                modalService.showUnsavedChangesWarning()
                    .then(function (response) {
                        if (response) {
                            rsm.context.okToClose = true;
                            rsm.context.dismiss(reason);
                        }
                    })
                    .catch(function (response) {
                        console.log(response);
                    });
            }
            else {
                rsm.context.okToClose = true;
                rsm.context.dismiss(reason);
            }
        };

        rsm.handleSubmitClick = function () {
            if (rsm.frmFoul.$valid) {
                var result = {
                    foulId: rsm.model.foul.id,
                    foul: rsm.model.foul,
                    performedById: rsm.model.performedBy.teamMembership.account.id,
                    performedBy: rsm.model.performedBy.teamMembership.account,
                    isTechnical: rsm.model.foul.isTechnical,
                    isFlagrant: rsm.model.foul.isFlagrant,
                    gameId: rsm.saveModel.game.id,
                    teamId: rsm.model.performedBy.teamMembership.teamId,
                    period: rsm.model.period,
                    clockTime: rsm.model.clockTime
                }

                close(result);
            }
        };

        function close(result) {
            rsm.context.okToClose = true;
            rsm.context.submit(result);
        }

        rsm.cancel = function () {
            rsm.onInterrupt('cancelled');
        };
    }
})();
