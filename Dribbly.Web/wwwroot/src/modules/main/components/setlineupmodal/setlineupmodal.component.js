(function () {
    'use strict';

    angular.module('mainModule')
        .component('drbblySetlineupmodal', {
            bindings: {
                /**
                 * {
                 *  team: [GameTeamModel]
                 * }
                 * */
                model: '<',
                context: '<',
                options: '<'
            },
            controllerAs: 'stu',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['$scope', 'modalService', 'drbblyEventsService', 'constants', 'drbblyOverlayService'];
    function controllerFn($scope, modalService, drbblyEventsService, constants, drbblyOverlayService) {
        var stu = this;

        stu.$onInit = function () {
            stu.overlay = drbblyOverlayService.buildOverlay();
            stu.players = angular.copy(stu.model.team.players);
            stu.players.forEach(p => {
                p.selected = !!p.isInGame;
            });

            stu.context.setOnInterrupt(stu.onInterrupt);
            drbblyEventsService.on('modal.closing', function (event, reason, result) {
                if (!stu.context.okToClose) {
                    event.preventDefault();
                    stu.onInterrupt();
                }
            }, $scope);
        };

        stu.toggleSelected = function (player) {
            player.selected = !player.selected;
            stu.hasMadeChanges = true;
        };

        stu.onInterrupt = function (reason) {
            if (stu.hasMadeChanges) {
                modalService.showUnsavedChangesWarning()
                    .then(function (response) {
                        if (response) {
                            stu.context.okToClose = true;
                            stu.context.dismiss(reason);
                        }
                    })
                    .catch(function (response) {
                        console.log(response);
                    });
            }
            else {
                stu.context.okToClose = true;
                stu.context.dismiss(reason);
            }
        };

        stu.handleSubmitClick = function () {
            close({ selectedPlayers: stu.players.drbblyWhere(p => p.selected) });
        };

        function close(result) {
            stu.context.okToClose = true;
            stu.context.submit(result);
        }

        stu.cancel = function () {
            stu.onInterrupt('cancelled');
        };
    }
})();
