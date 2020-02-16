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

    controllerFunc.$inject = ['authService', 'drbblyCourtshelperService', 'drbblyFileService', '$stateParams',
        'drbblyOverlayService', 'drbblyCourtsService', 'drbblyFooterService'];
    function controllerFunc(authService, drbblyCourtshelperService, drbblyFileService, $stateParams,
        drbblyOverlayService, drbblyCourtsService, drbblyFooterService) {
        var dcd = this;
        var _priceComponent;

        dcd.$onInit = function () {
            dcd.courtId = $stateParams.id;
            dcd.overlay = drbblyOverlayService.buildOverlay();
            dcd.isOwned = dcd.court.ownerId === authService.authentication.userId;
            dcd.overlay.setToReady();
            //loadCourt();
        };

        function loadCourt() {
            dcd.overlay.setToBusy();
            drbblyCourtsService.getCourt(dcd.courtId)
                .then(function (data) {
                    dcd.court = data;
                    dcd.isOwned = dcd.court.ownerId === authService.authentication.userId;
                    dcd.onUpdate(dcd.court);
                    dcd.overlay.setToReady();
                })
                .catch(dcd.overlay.setToError);
        }

        function createPriceComponent() {

            if (_priceComponent) {
                _priceComponent.remove();
            }

            _priceComponent = drbblyFooterService.addFooterItem({
                scope: $scope,
                template: '<drbbly-courtprice court="dcd.court"></dribbly-courtprice>'
            });
        }

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
                    //loadCourt();
                    dcd.onUpdate();
                })
                .catch(function (error) {
                    console.log(error);
                });
        };
    }
})();
