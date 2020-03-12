(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyCourtschedulecontainer', {
            bindings: {
                app: '<'
            },
            controllerAs: 'csc',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['drbblyCourtsService', '$stateParams', 'drbblyToolbarService', 'drbblyCourtshelperService',
        'drbblyOverlayService', '$timeout', '$state'];
    function controllerFunc(drbblyCourtsService, $stateParams, drbblyToolbarService, drbblyCourtshelperService,
        drbblyOverlayService, $timeout, $state) {
        console.log(Intl.DateTimeFormat().resolvedOptions().timeZone);
        var csc = this;

        csc.$onInit = function () {
            csc.courtId = $stateParams.id;
            drbblyCourtsService.getCourtGames(csc.courtId)
                .then(function (events) {
                    csc.games = massageEvents(events || []);
                    csc.calendarOptions = getCalendarOptions();
                });
        };

        function massageEvents(events) {
            return events.map(function (event) {
                event.start += 'Z';
                event.end += 'Z';
                return event;
            });
        }

        function getCalendarOptions() {
            return {};
        }
    }
})();
