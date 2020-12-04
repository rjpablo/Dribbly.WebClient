(function () {
    'use strict';

    angular.module('appModule')
        .component('drbblyPositionbadge', {
            bindings: {
                position: '<'
            },
            controllerAs: 'dpb',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['i18nService'];
    function controllerFn(i18nService) {
        var dpb = this;

        dpb.$onInit = function () {
            dpb.positionAbbrev = i18nService.getString('app.PlayerPositionAbbrevEnum.' + dpb.position);
        };
    }
})();
