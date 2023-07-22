(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyTournamentteams', {
            bindings: {
                app: '<',
                tournament: '<'
            },
            controllerAs: 'dtg',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['drbblyTournamentsService', 'modalService', '$timeout', 'drbblyCommonService',
        'authService', 'drbblyOverlayService'];
    function controllerFunc(drbblyTournamentsService, modalService, $timeout, drbblyCommonService,
        authService, drbblyOverlayService) {
        var dtg = this;

        dtg.$onInit = function () {
            dtg.isManager = dtg.tournament.addedById === authService.authentication.accountId;
        };

        dtg.rejectRequest = function (request) {
            modalService.confirm({ msg1Raw: 'Reject request?' })
                .then(confirmed => {
                    if (confirmed) {
                        dtg.processRequest(request, false);
                    }
                })
        }

        dtg.processRequest = function (request, shouldApprove) {
            request.isBusy = true;
            drbblyTournamentsService.processJoinRequest(request.id, shouldApprove)
                .then(result => {
                    dtg.tournament.joinRequests.drbblyRemove(r => r.id == request.id);
                    if (shouldApprove) {
                        dtg.tournament.teams.push(result);
                    }
                })
                .catch(e => drbblyCommonService.handleError(e))
                .finally(() => request.isBusy = false);
        }
    }
})();
