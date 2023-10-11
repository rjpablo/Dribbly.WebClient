(function () {
    'use strict';

    angular.module('mainModule')
        .component('drbblyTimeoutdetailsmodal', {
            bindings: {
                /**
                 * {
                 *  game: [GameModel],
                 *  onClockStart: [function]
                 * }
                 * */
                model: '<',
                context: '<',
                options: '<'
            },
            controllerAs: 'tdm',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['$scope', 'modalService', 'drbblyEventsService', 'drbblyGamesService', 'drbblyCommonService',
        'drbblyTimerhelperService', 'constants', 'drbblyOverlayService', 'drbblyFormshelperService', 'i18nService', '$timeout'];
    function controllerFn($scope, modalService, drbblyEventsService, drbblyGamesService, drbblyCommonService,
        drbblyTimerhelperService, constants, drbblyOverlayService, drbblyFormshelperService, i18nService, $timeout) {
        var tdm = this;

        tdm.$onInit = function () {
            tdm.team1 = tdm.model.game.team1;
            tdm.team2 = tdm.model.game.team2;
            tdm.type = 1;
            tdm.chargeTo = null;
            tdm.team1PlayerOptions = tdm.model.game.team1.players;
            tdm.team2PlayerOptions = tdm.model.game.team2.players;
            tdm.context.setOnInterrupt(tdm.onInterrupt);
            drbblyEventsService.on('modal.closing', function (event, reason, result) {
                if (!tdm.context.okToClose) {
                    event.preventDefault();
                    tdm.onInterrupt();
                }
            }, $scope);
        };

        tdm.submit = function () {
            var result = {
                gameId: tdm.model.game.id,
                clockTime: tdm.model.clockTime,
                period: tdm.model.period,
                type: tdm.chargeTo === constants.enums.timeoutTypeEnum.Official ?
                    constants.enums.timeoutTypeEnum.Official :
                    tdm.type,
                teamId: tdm.chargeTo === constants.enums.timeoutTypeEnum.Official ?
                    null : tdm.chargeTo
            };

            close(result);
        };

        tdm.onInterrupt = function (reason) {
            if (tdm.frmTimeout.$dirty) {
                modalService.showUnsavedChangesWarning()
                    .then(function (response) {
                        if (response) {
                            tdm.context.okToClose = true;
                            tdm.context.dismiss(reason);
                        }
                    })
                    .catch(function (response) {
                        console.log(response);
                    });
            }
            else {
                tdm.context.okToClose = true;
                tdm.context.dismiss(reason);
            }
        };

        function close(result) {
            tdm.context.okToClose = true;
            tdm.context.submit(result);
        }

        tdm.cancel = function () {
            tdm.onInterrupt('cancelled');
        };
    }
})();
