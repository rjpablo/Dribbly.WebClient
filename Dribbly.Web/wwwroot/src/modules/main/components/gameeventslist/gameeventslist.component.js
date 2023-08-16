(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyGameeventslist', {
            bindings: {
                game: '<',
                events: '<',
                onItemClicked: '<',
                onReady: '<',
                sideBySideThreshold: '<'
            },
            controllerAs: 'gel',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['drbblyTimerhelperService', '$window', 'constants'];
    function controllerFunc(drbblyTimerhelperService, $window, constants) {
        var gel = this;

        gel.$onInit = function () {
            gel.events.forEach(massageItem);
            gel.periods = gel.events.drbblyGroupBy('period', 'period');
            gel.periods.forEach(p => p.period = getPeriodLabel(p.period));
            angular.element($window).on('resize', setOrientation);
            if (gel.onReady) {
                gel.onReady({
                    updateItem: updateItem
                });
            }
            setOrientation();
        };

        function getPeriodLabel(period) {
            return period > gel.game.numberOfRegulationPeriods ?
                ('OT' + (period - gel.game.numberOfRegulationPeriods)) :
                (period || 0).toOrdinal();
        }

        function setOrientation() {
            gel.isSideBySide = gel.sideBySideThreshold && window.innerWidth >= gel.sideBySideThreshold;
        }

        gel.$onDestroy = function () {
            angular.element($window).off('resize', setOrientation);
        }

        gel.getEventDescription = event => {
            return event.type === constants.enums.gameEventTypeEnum.ShotMade ? '<span class="text-white font-weight-semibold">Shot&nbsp;Made</span> (+' + event.additionalData.points + 'pts)' :
                event.type === constants.enums.gameEventTypeEnum.ShotMissed ? '<span class="text-white font-weight-semibold">MISS</span>' :
                    event.type === constants.enums.gameEventTypeEnum.FoulCommitted ? '<span class="text-white font-weight-semibold">FOUL</span> (' + event.additionalData.foulName + ')' :
                        event.type === constants.enums.gameEventTypeEnum.ShotBlock ? '<span class="text-white font-weight-semibold">BLOCK</span>' :
                            event.type === constants.enums.gameEventTypeEnum.Assist ? '<span class="text-white font-weight-semibold">ASSIST</span>' :
                                event.type === constants.enums.gameEventTypeEnum.OffensiveRebound ? '<span class="text-white font-weight-semibold">REBOUND</span> (off)' :
                                    event.type === constants.enums.gameEventTypeEnum.DefensiveRebound ? '<span class="text-white font-weight-semibold">REBOUND</span> (def)' :
                                        event.type === constants.enums.gameEventTypeEnum.Timeout ? '<span class="text-white font-weight-semibold">TIMEOUT</span>' :
                                            event.type === constants.enums.gameEventTypeEnum.Steal ? '<span class="text-white font-weight-semibold">STEAL</span>' :
                                                event.type === constants.enums.gameEventTypeEnum.Turnover ? '<span class="text-white font-weight-semibold">TURNOVER</span> (' + event.additionalData.cause + ')' :
                                                    event.type;
        }

        function updateItem(e) {
            var orig = gel.events.drbblySingle(ev => ev.id === e.id);
            Object.assign(orig, e);
            massageItem(orig);
            orig.additionalData = typeof e.additionalData === 'string' ?
                JSON.parse(e.additionalData) :
                e.additionalData;
            orig.isTeam1 = e.teamId === gel.game.team1.teamId;
            orig.isTeam2 = e.teamId === gel.game.team2.teamId;
            orig.isBothTeams = e.teamId === null;
            orig.timeDisplay = drbblyTimerhelperService.breakupDuration(e.clockTime).formattedTime
        }

        function massageItem(e) {
            if (typeof e.additionalData === 'string') {
                e.additionalData = JSON.parse(e.additionalData);
            }
            e.isTeam1 = e.teamId === gel.game.team1.teamId;
            e.isTeam2 = e.teamId === gel.game.team2.teamId;
            e.isBothTeams = e.teamId === null;
            e.timeDisplay = drbblyTimerhelperService.breakupDuration(e.clockTime).formattedTime
            e.eventDescriptionTemplate = gel.getEventDescription(e);
        }

        gel._onItemClicked = function (event) {
            if (gel.onItemClicked) {
                gel.onItemClicked(event);
            }
        };
    }
})();
