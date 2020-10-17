(function () {
    'use strict';

    angular.module('appModule')
        .component('drbblyRating', {
            bindings: {
                value: '<',
                onValueSet: '<',
                editable: '<'
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

        drc.setValue = function (value) {
            if (drc.editable) {
                drc.value = value;
                if (drc.onValueSet) {
                    drc.onValueSet(value);
                }
            }
        };
    }
})();
