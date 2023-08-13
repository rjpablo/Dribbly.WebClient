﻿(function () {
    'use strict';

    angular.module('mainModule')
        .component('drbblyGameeventdetailsmodal', {
            bindings: {
                model: '<',
                context: '<',
                options: '<'
            },
            controllerAs: 'rsm',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['$scope', 'modalService', 'drbblyEventsService', 'constants', '$timeout',
        'drbblyGameeventsService', 'drbblyCommonService', 'drbblyGameeventshelperService'];
    function controllerFn($scope, modalService, drbblyEventsService, constants, $timeout,
        drbblyGameeventsService, drbblyCommonService, drbblyGameeventshelperService) {
        var rsm = this;

        rsm.$onInit = function () {
            rsm.saveModel = angular.copy(rsm.model.event, {});
            setPerformedByOptions();

            if (rsm.saveModel.type === constants.enums.gameEventTypeEnum.ShotMade
                || rsm.saveModel.type === constants.enums.gameEventTypeEnum.ShotMissed) {
                rsm.saveModel.points = rsm.saveModel.additionalData.points;
            }

            $timeout(function () { // wait for dropdown to be ready
                rsm.saveModel.performedBy = rsm.performedByOptions
                    .drbblySingle(p => p.teamMembership.account.id === rsm.saveModel.performedById);
            }, 100);

            rsm.context.setOnInterrupt(rsm.onInterrupt);
            drbblyEventsService.on('modal.closing', function (event, reason, result) {
                if (!rsm.context.okToClose) {
                    event.preventDefault();
                    rsm.onInterrupt();
                }
            }, $scope);
        };

        function setPerformedByOptions() {
            rsm.performedByOptions = rsm.model.game.team1.players.concat(rsm.model.game.team2.players);
        }

        rsm.revert = function () {
            modalService.confirm({
                titleRaw: 'Revert Play?',
                bodyTemplate: getRevertConfirmationMessageTemplate()
            })
                .then(confirmed => {
                    if (confirmed) {
                        rsm.isBusy = true;
                        drbblyGameeventsService.delete(rsm.saveModel.id)
                            .then(result => {
                                close(result);
                            })
                            .catch(err => {
                                drbblyCommonService.handleError(err);
                            })
                            .finally(() => rsm.isBusy = false);
                    }
                })

        };

        function getRevertConfirmationMessageTemplate() {
            var bodyTemplate = '';
            if ((rsm.model.associatedPlays.length || []) > 0) {
                bodyTemplate = '<p class="text-left">Revert this play and the following associated plays?</p>' +
                    '<ul>'
                rsm.model.associatedPlays.forEach(event => {
                    bodyTemplate += `<li class="text-left">${drbblyGameeventshelperService.getDescription(event)} - ${event.performedBy.name}</li>`
                })
                bodyTemplate += '</ul>';
            }
            else {
                bodyTemplate = '<p class="text-center">Revert play?</p>';
            }
            return bodyTemplate;
        }

        rsm.onInterrupt = function (reason) {
            if (rsm.frmShot.$dirty) {
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
            var input = rsm.saveModel;
            input.performedById = rsm.saveModel.performedBy.teamMembership.account.id;
            input.teamId = input.performedBy.teamMembership.teamId;
            rsm.isBusy = true;
            drbblyGameeventsService.update(input)
                .then(result => {
                    close(result);
                })
                .catch(err => {
                    drbblyCommonService.handleError(err);
                })
                .finally(() => rsm.isBusy = false);
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
