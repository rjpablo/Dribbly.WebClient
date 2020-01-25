(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyImage', {
            bindings: {
                imageUrl: '@'
            },
            controllerAs: 'dic',
            templateUrl: 'drbbly-default'
        });
})();
