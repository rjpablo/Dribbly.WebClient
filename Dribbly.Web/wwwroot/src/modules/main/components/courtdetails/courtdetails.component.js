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

    controllerFunc.$inject = ['authService', 'drbblyCourtshelperService', 'drbblyFileService'];
    function controllerFunc(authService, drbblyCourtshelperService, drbblyFileService) {
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

        dcd.changePrimaryPicture = function (file) {
            drbblyFileService.upload(file, 'api/courts/updateCourtPhoto/' + dcd.court.id)
                .then(function (result) {
                    dcd.onUpdate();
                })
                .catch(function (error) {
                    console.log(error);
                });
        };
    }
})();
