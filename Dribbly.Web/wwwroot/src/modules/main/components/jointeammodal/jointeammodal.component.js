(function () {
    'use strict';

    angular.module('mainModule')
        .component('drbblyJointeammodal', {
            bindings: {
                model: '<',
                context: '<',
                options: '<'
            },
            controllerAs: 'jtm',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['$scope', 'modalService', 'drbblyEventsService', 'drbblyTeamsService', 'drbblyCommonService',
        'constants', 'drbblyOverlayService', '$timeout'];
    function controllerFn($scope, modalService, drbblyEventsService, drbblyTeamsService, drbblyCommonService,
        constants, drbblyOverlayService, $timeout) {
        var jtm = this;

        jtm.$onInit = function () {
            jtm.overlay = drbblyOverlayService.buildOverlay();
            jtm.teamStatus = constants.enums.teamStatus;
            jtm.request = { teamId: jtm.model.teamId };

            if (jtm.model.isEditByManager) {
                $timeout(function () {
                    jtm.request.jerseyNo = jtm.model.request.jerseyNo;
                    jtm.request.memberAccountId = jtm.model.request.memberAccountId;
                });
            }

            jtm.context.setOnInterrupt(jtm.onInterrupt);
            drbblyEventsService.on('modal.closing', function (event, reason, result) {
                if (!jtm.context.okToClose) {
                    event.preventDefault();
                    jtm.onInterrupt();
                }
            }, $scope);
        };

        jtm.onInterrupt = function (reason) {
            if (jtm.frmJoinTeam.$dirty) {
                modalService.showUnsavedChangesWarning()
                    .then(function (response) {
                        if (response) {
                            jtm.context.okToClose = true;
                            jtm.context.dismiss(reason);
                        }
                    })
                    .catch(function (response) {
                        console.log(response);
                    });
            }
            else {
                jtm.context.okToClose = true;
                jtm.context.dismiss(reason);
            }
        };

        jtm.submit = function () {
            if (jtm.frmJoinTeam.$valid) {
                var saveModel = angular.copy(jtm.request);
                jtm.isBusy = true;
                drbblyTeamsService.joinTeam(saveModel)
                    .then(function (result) {
                        jtm.isBusy = false;
                        close(result);
                    }, function (error) {
                        jtm.isBusy = false;
                        drbblyCommonService.handleError(error);
                    });
            }
        };

        jtm.approve = function () {
            close({ request: jtm.request, shouldApprove: true });
        }

        function close(result) {
            jtm.context.okToClose = true;
            jtm.context.submit(result);
        }

        jtm.cancel = function () {
            jtm.onInterrupt('cancelled');
        };
    }
})();
