(function () {
    'use strict';

    angular.module('appModule')
        .component('drbblyRating', {
            bindings: {
                value: '<'
            },
            controllerAs: 'drc',
            templateUrl: '/shared/modules/app/components/rating/rating.component.html',
            controller: controllerFn
        });

    controllerFn.$inject = ['$element'];
    function controllerFn($element) {
        var drc = this;

        drc.$onInit = function () {
            $element.addClass('drbbly-rating');
        };
    }
})();
