(function () {
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
        var _gameEventTypeEnum = constants.enums.gameEventTypeEnum;
        var _allPlayers;

        rsm.$onInit = function () {
            rsm.event = angular.copy(rsm.model.event, {});
            rsm.eventIsShot = rsm.event.type === _gameEventTypeEnum.ShotMade
                || rsm.event.type === _gameEventTypeEnum.ShotMissed;
            rsm.eventIsRebound = rsm.event.type === _gameEventTypeEnum.DefensiveRebound
                || rsm.event.type === _gameEventTypeEnum.OffensiveRebound;
            _allPlayers = rsm.model.game.team1.players.concat(rsm.model.game.team2.players);
            setPerformedByOptions();

            if (rsm.eventIsShot) {
                rsm.event.points = rsm.event.additionalData.points;
            }

            $timeout(function () { // wait for dropdown to be ready
                rsm.event.performedBy = rsm.performedByOptions
                    .drbblySingle(p => p.teamMembership.account.id === rsm.event.performedById);
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
            if (rsm.eventIsShot || rsm.eventIsRebound) {
                rsm.performedByOptions = _allPlayers;
            }
        }

        rsm.revert = function () {
            modalService.confirm({
                titleRaw: 'Revert Play?',
                bodyTemplate: getRevertConfirmationMessageTemplate()
            })
                .then(confirmed => {
                    if (confirmed) {
                        rsm.isBusy = true;
                        drbblyGameeventsService.delete(rsm.event.id)
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
            if (rsm.eventIsShot && (rsm.model.associatedPlays.length || []) > 0) {
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
            if (rsm.frmEvent.$dirty) {
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
            var input = rsm.event;
            input.performedById = rsm.event.performedBy.teamMembership.account.id;
            input.teamId = input.performedBy.teamMembership.teamId;
            rsm.isBusy = true;
            if (rsm.eventIsShot) {
                input.type = input.isMiss ? _gameEventTypeEnum.ShotMissed : _gameEventTypeEnum.ShotMade;
            }
            else if (rsm.eventIsRebound) {
                var shot = rsm.model.associatedPlays
                    .drbblySingleOrDefault(e => e.type === _gameEventTypeEnum.ShotMade || e.type === _gameEventTypeEnum.ShotMissed);
                if (shot) {
                    var shotPerformedBy = _allPlayers.drbblySingleOrDefault(p => p.accountId === shot.performedById);
                    if (shotPerformedBy) {
                        input.type = input.performedBy.teamMembership.teamId === shotPerformedBy.teamMembership.teamId ?
                            _gameEventTypeEnum.OffensiveRebound :
                            _gameEventTypeEnum.DefensiveRebound;
                    }
                }
            }
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
