(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyCourtdetails', {
            bindings: {
                court: '<',
                onUpdate: '<'
            },
            controllerAs: 'dcd',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['authService', 'drbblyCourtshelperService'];
    function controllerFunc(authService, drbblyCourtshelperService) {
        var dcd = this;

        dcd.$onInit = function () {
            dcd.isOwned = dcd.court.ownerId === authService.authentication.userId;
        };

        dcd.edit = function () {
            drbblyCourtshelperService.editCourt(dcd.court)
                .then(function () {
                    dcd.onUpdate();
                })
                .catch(function () { /*do nothing*/ });
        };
    }
})();
