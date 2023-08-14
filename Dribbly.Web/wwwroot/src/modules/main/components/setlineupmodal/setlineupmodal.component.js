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
            stu.teams = angular.copy(stu.model.teams);
            stu.teams.forEach(t => {
                t.players.forEach(p => {
                    p.selected = !!p.isInGame;
                });
            })
            if (stu.model.selectedTeam) {
                stu.activeTab = stu.model.selectedTeam.id;
            }

            stu.context.setOnInterrupt(stu.onInterrupt);
            drbblyEventsService.on('modal.closing', function (event, reason, result) {
                if (!stu.context.okToClose) {
                    event.preventDefault();
                    stu.onInterrupt();
                }
            }, $scope);
        };

        stu.toggleSelected = function (player, team) {
            player.selected = !player.selected;
            team.isModified = true;
            stu.hasMadeChanges = true;
            team.inValid = team.players.drbblyCount(p => p.selected) > 5
            stu.inValid = stu.teams.drbblyAny(t => t.inValid);
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
            var result = [];
            stu.teams.drbblyWhere(t => t.isModified).forEach(t => {
                result.push({
                    teamId: t.teamId,
                    selectedPlayers: t.players.drbblyWhere(p => p.selected)
                })
            });
            close(result);
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
