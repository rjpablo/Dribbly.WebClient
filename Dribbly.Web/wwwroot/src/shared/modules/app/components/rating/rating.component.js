(function () {
    'use strict';

    angular.module('appModule')
        .component('drbblyRating', {
            bindings: {
                value: '<'
            },
            controllerAs: 'drc',
            templateUrl: 'drbbly-default',
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
