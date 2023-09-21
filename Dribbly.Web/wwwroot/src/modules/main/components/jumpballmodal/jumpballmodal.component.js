(function () {
    'use strict';

    angular.module('mainModule')
        .component('drbblyJumpballmodal', {
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
            controllerAs: 'jbm',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['$scope', 'modalService', 'drbblyEventsService', 'drbblyGamesService', 'drbblyCommonService',
        'drbblyTimerhelperService', 'constants', 'drbblyOverlayService', 'drbblyFormshelperService', 'i18nService', '$timeout'];
    function controllerFn($scope, modalService, drbblyEventsService, drbblyGamesService, drbblyCommonService,
        drbblyTimerhelperService, constants, drbblyOverlayService, drbblyFormshelperService, i18nService, $timeout) {
        var jbm = this;

        jbm.$onInit = function () {
            jbm.team1 = jbm.model.game.team1;
            jbm.team2 = jbm.model.game.team2;
            jbm.team1PlayerOptions = jbm.model.game.team1.players.drbblyWhere(p => p.isInGame);
            jbm.team2PlayerOptions = jbm.model.game.team2.players.drbblyWhere(p => p.isInGame);
            jbm.context.setOnInterrupt(jbm.onInterrupt);
            drbblyEventsService.on('modal.closing', function (event, reason, result) {
                if (!jbm.context.okToClose) {
                    event.preventDefault();
                    jbm.onInterrupt();
                }
            }, $scope);
        };

        jbm.onInterrupt = function (reason) {
            jbm.context.okToClose = true;
            jbm.context.dismiss(reason);
        };

        jbm.close = function (result) {
            close(result);
        };

        jbm.startClock = function () {
            if (jbm.frmJumpball.$valid) {
                jbm.model.onClockStart({
                    team1Player: jbm.team1Player.teamMembership,
                    team2Player: jbm.team2Player.teamMembership
                });
                close(null);
            }
        };

        function close(result) {
            jbm.context.okToClose = true;
            jbm.context.submit(result);
        }

        jbm.cancel = function () {
            jbm.onInterrupt('cancelled');
        };
    }
})();
