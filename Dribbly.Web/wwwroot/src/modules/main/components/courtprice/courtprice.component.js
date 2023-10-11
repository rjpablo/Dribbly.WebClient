(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyCourtprice', {
            bindings: {
                court: '<'
            },
            controllerAs: 'cpc',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['drbblyCourtshelperService', '$state'];
    function controllerFunc(drbblyCourtshelperService, $state) {
        var cpc = this;

        cpc.book = function () {
            drbblyCourtshelperService.openBookingDetailsModal({ courtId: cpc.court.id })
                .then(function (result) {
                    $state.go('main.court.schedule', { focusedEventId: result.id, defaultDate: result.start });
                })
                .catch(function (error) {

                });
        };
    }
})();
