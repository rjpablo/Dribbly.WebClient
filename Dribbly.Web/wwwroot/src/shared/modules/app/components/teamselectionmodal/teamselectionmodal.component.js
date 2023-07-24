(function () {
    'use strict';

    angular.module('appModule')
        .component('drbblyTeamselectionmodal', {
            bindings: {
                /**
                 * {
                 *  teams: [{
                 *    name: [string],
                 *    logo: [PhotoModel]
                 *  }[]],
                 *  // A callback function that will be called on every team to determine
                 *  // whether the team is selected by default, passing the team as parameter
                 *  isSelectedCallback: [fn],
                 *  // A callback function that will be called when the submit button is clicked,
                 *  passing the collection of selected teams as parameter.
                 *  // Returns a promise that causes the modal to close when resolved.
                 *  onSubmitCallback: [fn]
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
                t.selected = stu.model.isSelectedCallback(t);
            });

            stu.context.setOnInterrupt(stu.onInterrupt);
            drbblyEventsService.on('modal.closing', function (event, reason, result) {
                if (!stu.context.okToClose) {
                    event.preventDefault();
                    stu.onInterrupt();
                }
            }, $scope);
        };

        stu.toggleSelected = function (team) {
            team.selected = !team.selected;
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
            var output = {
                selectedTeams: stu.teams.drbblyWhere(p => p.selected)
            };
            if (stu.model.onSubmitCallback) {
                stu.isBusy = true;
                stu.model.onSubmitCallback(output)
                    .then(() => {
                        close(output);
                    })
                    .finally(() => stu.isBusy = false)
            }
            else {
                close(output);
            }
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
