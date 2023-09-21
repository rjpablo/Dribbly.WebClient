(function () {
    'use strict';

    angular.module('mainModule')
        .component('drbblyPlayerselectormodal', {
            bindings: {
                /*
                 * {
                 *  players: GamePlayer[]
                 * } 
                 * */
                model: '<',
                context: '<',
                options: '<'
            },
            controllerAs: 'psm',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['$scope', 'drbblyEventsService', 'constants', 'drbblyOverlayService'];
    function controllerFn($scope, drbblyEventsService, constants, drbblyOverlayService) {
        var psm = this;

        psm.$onInit = function () {
            groupChoices();

            psm.context.setOnInterrupt(psm.onInterrupt);
            drbblyEventsService.on('modal.closing', function (event, reason, result) {
                if (!psm.context.okToClose) {
                    event.preventDefault();
                    psm.onInterrupt();
                }
            }, $scope);
        };

        function groupChoices() {
            psm.teams = [];
            psm.model.players.forEach(p => {
                var team = psm.teams.drbblySingleOrDefault(t => t.id === p.teamMembership.teamId);
                if (team) {
                    team.players.push(p);
                }
                else {
                    team = {
                        id: p.teamMembership.teamId,
                        players: [p]
                    };
                    psm.teams.push(team);
                }
            });
        }

        psm.select = function (player) {
            close(player);
        };

        psm.onInterrupt = function (reason) {
            psm.context.okToClose = true;
            psm.context.dismiss(reason);
        };

        function close(result) {
            psm.context.okToClose = true;
            psm.context.submit(result);
        }

        psm.cancel = function () {
            psm.onInterrupt('cancelled');
        };
    }
})();
