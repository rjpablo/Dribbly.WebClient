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

    controllerFn.$inject = ['settingsService', 'drbblyDatetimeService'];
    function controllerFn(settingsService, drbblyDatetimeService) {
        var dte = this;

        dte.$onInit = function () {
            dte.format = dte.format || settingsService.defaultDateFormat;
            if (dte.asFromNow) {
                dte.dateText = moment(drbblyDatetimeService.toUtcString(dte.date)).fromNow();
            }
        };
    }
})();
