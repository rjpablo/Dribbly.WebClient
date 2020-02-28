(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyCourtprice', {
            bindings: {
                courtId: '<'
            },
            controllerAs: 'cpc',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['drbblyCourtshelperService'];
    function controllerFunc(drbblyCourtshelperService) {
        var cpc = this;

        cpc.book = function () {
            drbblyCourtshelperService.openBookGameModal(cpc.courtId)
                .then(function (result) {
                    //redirect to game details
                })
                .catch(function (error) {

                });
        };
    }
})();
