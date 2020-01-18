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

    controllerFn.$inject = ['drbblyCourtsService'];
    function controllerFn(drbblyCourtsService) {
        var rcm = this;

        rcm.$onInit = function () {

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
