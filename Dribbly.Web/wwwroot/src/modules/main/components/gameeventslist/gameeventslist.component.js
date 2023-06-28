(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyGameeventslist', {
            bindings: {
                game: '<',
                events: '<'
            },
            controllerAs: 'gel',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['modalService', '$element'];
    function controllerFunc(modalService, $element) {
        var gel = this;

        gel.$onInit = function () {
            gel.events.forEach(e => {
                e.additionalData = JSON.parse(e.additionalData);
                e.isTeam1 = e.teamId === gel.game.team1.teamId;
                e.isTeam2 = e.teamId === gel.game.team2.teamId;
            });
        };
    }
})();
