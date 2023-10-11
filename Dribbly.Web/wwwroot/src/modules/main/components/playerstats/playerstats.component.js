(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyPlayerstats', {
            bindings: {
                player: '<'
            },
            controllerAs: 'psc',
            templateUrl: 'drbbly-default'
        });
})();
