(function () {
    'use strict';

    angular.module('siteModule')
        .component('drbblyDate', {
            bindings: {
                date: '<',
                format: '<',
                asFromNow: '<'
            },
            controllerAs: 'dte',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['settingsService'];
    function controllerFn(settingsService) {
        var dte = this;

        dte.$onInit = function () {
            dte.format = dte.format || settingsService.defaultDateFormat;
            if (dte.asFromNow) {
                dte.dateText = moment(dte.date).fromNow();
            }
        };
    }
})();
