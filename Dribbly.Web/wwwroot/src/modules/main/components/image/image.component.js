(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyImage', {
            bindings: {
                imageUrl: '@',
                onClick: '<'
            },
            controllerAs: 'dic',
            templateUrl: 'drbbly-default'
        });
})();
