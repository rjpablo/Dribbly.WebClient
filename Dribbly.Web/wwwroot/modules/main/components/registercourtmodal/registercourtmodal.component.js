(function () {
    'use strict';

    angular.module('siteModule')
        .component('drbblyRegistercourtmodal', {
            bindings: {
                model: '<',
                context: '<',
                options: '<'
            },
            controllerAs: 'rcm',
            templateUrl: '/modules/main/components/registercourtmodal/registercourtmodal.component.html',
            controller: controllerFn
        });

    controllerFn.$inject = ['drbblyCourtsService', 'modalService'];
    function controllerFn(drbblyCourtsService, modalService) {
        var rcm = this;

        rcm.$onInit = function () {
        };

        rcm.openLocationPicker = function () {
            return modalService.show({
                view: '<drbbly-locationpickermodal></drbbly-locationpickermodal>',
                model: rcm.model,
                optoins: rcm.options
            })
                .then(function (selectedLocation) {
                    if (selectedLocation) {
                        rcm.court.latitude = selectedLocation.latitude;
                        rcm.court.longitude = selectedLocation.longitude;
                    }
                })
                .catch(function () {

                });
        };

        rcm.locationSelected = function (latLng) {
            rcm.latitude = latLng.latitude;
            rcm.longitude = latLng.longitude;
        };

        rcm.submit = function () {
            drbblyCourtsService.register(rcm.court)
                .then(function () {
                    rcm.context.submit();
                })
                .catch(function () {
                    rcm.isBusy = false;
                });
        };

        rcm.cancel = function () {
            rcm.context.dismiss('dismissed');
        };
    }
})();
