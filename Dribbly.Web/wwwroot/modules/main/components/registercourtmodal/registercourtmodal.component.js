(function () {
    'use strict';

    angular.module('siteModule')
        .component('drbblyRegistercourtmodal', {
            bindings: {
                model: '<',
                context: '<'
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
                view: '<drbbly-locationpicker></drbbly-locationpicker>',
                model: {}
            })
                .then(function (selectedLocation) {
                    console.log(selectedLocation);
                })
                .catch(function () {

                });
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
