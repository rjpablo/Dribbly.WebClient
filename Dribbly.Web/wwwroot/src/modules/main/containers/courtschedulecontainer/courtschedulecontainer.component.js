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

    controllerFunc.$inject = ['drbblyCourtsService', '$element', 'drbblyToolbarService', 'drbblyCourtshelperService',
        'drbblyOverlayService', '$timeout', '$state'];
    function controllerFunc(drbblyCourtsService, $element, drbblyToolbarService, drbblyCourtshelperService,
        drbblyOverlayService, $timeout, $state) {
        var csc = this;

        csc.schedulerConfig = {
            startDate: '2020-02-24',
            viewType: "Week"
        };

        csc.events = [
            {
                start: new DayPilot.Date("2020-02-24T10:00:00"),
                end: new DayPilot.Date("2020-02-24T14:00:00"),
                id: DayPilot.guid(),
                text: "First Event"
            }
        ];

        csc.$onInit = function () {
        };
    }
})();
