(function () {
    'use strict';

    angular
        .module('appModule')
        .component('drbblyImage', {
            bindings: {
                imageUrl: '@'
            },
            controllerAs: 'dic',
            templateUrl: '/modules/main/components/image/image.component.html'
        });
})();
