(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyGameeventslist', {
            bindings: {
                game: '<',
                events: '<',
                onItemClicked: '<',
                onReady: '<'
            },
            controllerAs: 'gel',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['drbblyTimerhelperService', '$element'];
    function controllerFunc(drbblyTimerhelperService, $element) {
        var gel = this;

        gel.$onInit = function () {
            gel.events.forEach(massageItem);

            if (gel.onReady) {
                gel.onReady({
                    updateItem: updateItem
                });
            }
        };

        function updateItem(e) {
            var orig = gel.events.drbblySingle(ev => ev.id === e.id);
            Object.assign(orig, e);
            massageItem(orig);
            orig.additionalData = JSON.parse(e.additionalData);
            orig.isTeam1 = e.teamId === gel.game.team1.teamId;
            orig.isTeam2 = e.teamId === gel.game.team2.teamId;
            orig.isBothTeams = e.teamId === null;
            orig.timeDisplay = drbblyTimerhelperService.breakupDuration(e.clockTime).formattedTime
        }

        function massageItem(e) {
            e.additionalData = JSON.parse(e.additionalData);
            e.isTeam1 = e.teamId === gel.game.team1.teamId;
            e.isTeam2 = e.teamId === gel.game.team2.teamId;
            e.isBothTeams = e.teamId === null;
            e.timeDisplay = drbblyTimerhelperService.breakupDuration(e.clockTime).formattedTime
        }

        gel._onItemClicked = function (event) {
            if (gel.onItemClicked) {
                gel.onItemClicked(event);
            }
        };
    }
})();
