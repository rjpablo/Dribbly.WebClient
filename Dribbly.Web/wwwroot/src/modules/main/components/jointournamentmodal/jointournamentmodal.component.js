(function () {
    'use strict';

    angular.module('mainModule')
        .component('drbblyJointournamentmodal', {
            bindings: {
                /** model definition:
                 * {
                 *  tournament: [TournamentModel],
                 *  teamChoices: [ChoiceItemModel[]]
                 * }
                 * */
                model: '<',
                context: '<',
                options: '<'
            },
            controllerAs: 'jtm',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['$scope', 'drbblyEventsService', 'drbblyTournamentsService', 'drbblyCommonService'];
    function controllerFn($scope, drbblyEventsService, drbblyTournamentsService, drbblyCommonService) {
        var jtm = this;

        jtm.$onInit = function () {

            jtm.context.setOnInterrupt(jtm.onInterrupt);
            drbblyEventsService.on('modal.closing', function (event, reason, result) {
                if (!jtm.context.okToClose) {
                    event.preventDefault();
                    jtm.onInterrupt();
                }
            }, $scope);
        };

        jtm.onInterrupt = function (reason) {
            jtm.context.okToClose = true;
            jtm.context.dismiss(reason);
        };

        jtm.close = function (result) {
            close(result);
        };

        jtm.submit = function () {
            if (jtm.frmJoinTournament.$valid) {
                jtm.isBusy = true;
                drbblyTournamentsService.joinTournament(jtm.model.tournament.id, jtm.teamId)
                    .then(function () {
                        jtm.isBusy = false;
                        close();
                    }, function (error) {
                        jtm.isBusy = false;
                        drbblyCommonService.handleError(error);
                    });
            }
        };

        function close(result) {
            jtm.context.okToClose = true;
            jtm.context.submit(result);
        }

        jtm.cancel = function () {
            jtm.onInterrupt('cancelled');
        };
    }
})();
